import PQueue from 'p-queue';
import TelegramBot from 'node-telegram-bot-api';

import { db } from './lib/db.js';
import validateAddress from './validateAddress.js';
import swapSolToToken from './swapSolForToken.js';
import isValidSolanaAddressOrToken from './utils/isValidSolanaAddress.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token, { polling: true });

let bot = createBot();

const queue = new PQueue({ interval: 10000, intervalCap: 1 }); // 1 task every 10s

function createBot() {
  const b = new TelegramBot(token, { polling: true });

  b.on('polling_error', (err) => {
    console.error('Polling error:', err.message);

    restartBot();
  });

  return b;
}

function restartBot() {
  try {
    console.log('Restarting bot polling...');

    bot
      .stopPoll()
      .then(() => {
        bot = createBot();
      })
      .catch(console.error);
  } catch (e) {
    console.error('Failed to restart bot:', e);
  }
}

bot.on('message', async (msg) => {
  const text = msg.text?.trim();

  if (!text) return;

  const isValid = isValidSolanaAddressOrToken(text);

  if (!isValid) return;

  const validation = await validateAddress(text);

  if (!validation.valid) {
    console.error('❌ Invalid or non-existent Solana address');
    return;
  }

  queue.add(() => handleMessage(text));
});

async function handleMessage(text) {
  try {
    console.log(`New Address : ${text}`);

    const { signature, name, symbol } = await swapSolToToken(text);

    const collection = db.collection('token_buys');

    const doc = await collection.insertOne({
      name,
      symbol,
      mint: text,
      value: '5$',
      hash: signature,
      boughtAt: new Date(),
    });

    console.log('✅ New Document Inserted: ', doc);
  } catch (error) {
    console.log('Error in FDV');

    console.log(error);
  }
}

export default bot;
