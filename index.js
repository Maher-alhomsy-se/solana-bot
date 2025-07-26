import cron from 'node-cron';

import delay from './delay.js';
import { tokensCollection } from './lib/db.js';
import swapTokenToSol from './swapTokenForSol.js';

async function main() {
  const tokens = await tokensCollection.find().toArray();

  for (const token of tokens) {
    const { mint } = token;
    await swapTokenToSol(mint);

    console.log('\n\n');
    await delay(10000);
  }

  console.log('✅ Done');
}

cron.schedule('0 12 */7 * *', () => {
  console.log(`\n🔄 Auto-sell triggered at ${new Date().toISOString()}`);
  main();
});
