import cron from 'node-cron';

import {
  tokensCollection,
  balanceCollection,
  balanceHistoryCollection,
} from './lib/db.js';
import delay from './delay.js';
import swapTokenToSol from './swapTokenForSol.js';

async function main() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const tokens = await tokensCollection
    .find({ boughtAt: { $gte: sevenDaysAgo } })
    .toArray();

  for (const token of tokens) {
    const { mint } = token;
    await swapTokenToSol(mint);

    console.log('\n\n');
    await delay(10000);
  }

  const balanceDoc = await balanceCollection.findOne({
    _id: 'wallet-balance',
  });

  const prevTotalBalance = balanceDoc?.totalBalance || 0;

  await balanceCollection.updateOne(
    { _id: 'wallet-balance' },
    { $set: { totalBalance: 0 } },
    { upsert: true }
  );

  await balanceHistoryCollection.insertOne({
    prevTotalBalance,
    date: new Date(),
  });

  console.log('✅ Tokens sold and balance reset.');
}

cron.schedule('0 12 */7 * *', () => {
  console.log(`\n🔄 Auto-sell triggered at ${new Date().toISOString()}`);
  main();
});
