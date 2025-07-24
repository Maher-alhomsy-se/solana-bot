import { clusterApiUrl, Connection } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'), {
  commitment: 'confirmed',
});

export default connection;
