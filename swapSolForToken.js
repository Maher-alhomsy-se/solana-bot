import { createJupiterApiClient } from '@jup-ag/api';
import {
  Connection,
  Keypair,
  clusterApiUrl,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';

import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY_BASE58;

const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
const connection = new Connection(clusterApiUrl('mainnet-beta'), {
  commitment: 'confirmed',
});

const jupiter = createJupiterApiClient({
  basePath: 'https://lite-api.jup.ag/swap/v1',
});

async function swapSolToToken(tokenMint) {
  const quoteResponse = await jupiter.quoteGet({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: tokenMint,
    amount: (0.001 * 1e9).toFixed(), // 0.001 SOL in lamports
    slippageBps: 100,
  });

  if (!quoteResponse || !quoteResponse.outAmount) {
    throw new Error('❌ No swap route found');
  }

  const userPublicKey = payer.publicKey.toBase58();

  const swapResponse = await jupiter.swapPost({
    swapRequest: { quoteResponse, userPublicKey, wrapAndUnwrapSol: true },
  });

  if (!swapResponse.swapTransaction) {
    throw new Error('❌ Swap transaction not returned from Jupiter API');
  }

  const serializedTx = Buffer.from(swapResponse.swapTransaction, 'base64');
  const tx = VersionedTransaction.deserialize(serializedTx);
  tx.sign([payer]);

  const signature = await sendAndConfirmRawTransaction(
    connection,
    tx.serialize()
  );

  console.log('✅ Swap succeeded. Tx:', signature);
}

export default swapSolToToken;
