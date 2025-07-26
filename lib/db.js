import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const URL = process.env.DB_URL;
const client = new MongoClient(URL);

client.connect().then(() => {
  console.log('Connected');
});

client.on('error', (error) => {
  console.log('Error');

  console.log(error);
});

export const db = client.db('solana_bot');
export const txCollection = db.collection('incoming_tx');
export const tokensCollection = db.collection('token_buys');
export const balanceCollection = db.collection('total_balance');
export const balanceHistoryCollection = db.collection('balance_history');
