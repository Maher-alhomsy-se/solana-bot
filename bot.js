import TelegramBot from 'node-telegram-bot-api';

import { db } from './lib/db.js';
import validateAddress from './validateAddress.js';
import swapSolToToken from './swapSolForToken.js';
import isValidSolanaAddressOrToken from './utils/isValidSolanaAddress.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

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

  try {
    const hash = await swapSolToToken(text);

    const collection = db.collection('token_buys');

    const doc = await collection.insertOne({
      hash,
      mint: text,
      value: '0.001',
      boughtAt: new Date(),
    });

    console.log('✅ New Document Inserted: ', doc);
  } catch (error) {
    console.log('Error in FDV');

    console.log(error);
  }
});

export default bot;
