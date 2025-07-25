import { MongoClient } from 'mongodb';

const URL =
  'mongodb+srv://mahera:8wBJ4ff232EG01ja@cluster0.ksv7dt5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(URL);

client.connect().then(() => {
  console.log('Connected');
});

client.on('error', (error) => {
  console.log('Error');

  console.log(error);
});

export const db = client.db('solana_bot');
