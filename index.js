import cron from 'node-cron';

import {
  txCollection,
  tokensCollection,
  balanceCollection,
  balanceHistoryCollection,
} from './lib/db.js';
import bot from './bot.js';
import delay from './delay.js';
import swapTokenToSol from './swapTokenForSol.js';
import sendSolToUser from './utils/sendSolToUser.js';

async function main() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Fetch all tokens that Bought in Last 7 days
    const tokens = await tokensCollection
      .find({ boughtAt: { $gte: sevenDaysAgo } })
      .toArray();

    // 2. Swap Tokens to Sol (Sell)
    for (const token of tokens) {
      const { mint } = token;
      await swapTokenToSol(mint);

      console.log('\n\n');
      await delay(10000);
    }

    // 3. Fetch current total balance
    const balanceDoc = await balanceCollection.findOne({
      _id: 'wallet-balance',
    });

    const prevTotalBalance = balanceDoc?.totalBalance || 0;

    // 4. Fetch user transactions in the last 7 days
    const userTxs = await txCollection
      .find({ time: { $gte: sevenDaysAgo } })
      .toArray();

    const totalUserSentIn7Days = userTxs.reduce(
      (sum, tx) => sum + Number(tx.value),
      0
    );

    // 5. Calculate 80% to distribute
    const keepAmount = prevTotalBalance * 0.2;
    const distributable = prevTotalBalance * 0.8;

    // 6. Group by user and calculate percentage shares
    const userMap = {};

    for (const tx of userTxs) {
      const from = tx.from_address;
      userMap[from] = (userMap[from] ?? 0) + Number(tx.value);
    }

    for (const [user, amount] of Object.entries(userMap)) {
      const percentage = amount / totalUserSentIn7Days;
      const userShare = percentage * distributable;

      // 👇 Your logic to send userShare to `user` wallet
      await sendSolToUser(user, userShare); // Define this function based on your wallet API
      await delay(6000);
    }

    // 7. Reset Total Balance to 0
    await balanceCollection.updateOne(
      { _id: 'wallet-balance' },
      { $set: { totalBalance: 0 } },
      { upsert: true }
    );

    // 8. Save balance history
    await balanceHistoryCollection.insertOne({
      keepAmount,
      distributable,
      prevTotalBalance,
      soldAt: new Date(),
      userBreakdown: userMap,
      totalUserSent: totalUserSentIn7Days,
    });

    console.log('✅ All tokens sold, users paid, and balance reset.');
  } catch (error) {
    console.log('Error ', error);
  }
}

cron.schedule('0 12 */7 * *', () => {
  console.log(`\n🔄 Auto-sell triggered at ${new Date().toISOString()}`);
  main();
});
