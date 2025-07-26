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
