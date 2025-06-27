import { createJupiterApiClient } from '@jup-ag/api';
import {
  Connection,
  Keypair,
  Transaction,
  clusterApiUrl,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';

import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY_BASE58;
if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY_BASE58 in .env');

const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
const connection = new Connection(clusterApiUrl('mainnet-beta'), {
  commitment: 'confirmed',
});

// Create client using free endpoint; replace with api.jup.ag + x-api-key for paid usage
const jupiter = createJupiterApiClient({
  basePath: 'https://lite-api.jup.ag/swap/v1',
});

async function swapSolToToken(tokenMint) {
  // 1. Get a quote
  const quoteResponse = await jupiter.quoteGet({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: tokenMint,
    amount: (0.05 * 1e9).toFixed(), // Amount as string
    slippageBps: 100,
  });

  if (!quoteResponse.data || quoteResponse.data.length === 0) {
    throw new Error('❌ No swap route found');
  }

  const bestRoute = quoteResponse.data[0];

  // 2. Build swap transaction
  const swapRequest = {
    quoteResponse: bestRoute,
    userPublicKey: payer.publicKey.toBase58(),
    wrapUnwrapSOL: true,
    // optional flags: skipPreflight, readonlyRecents, allowVersionedTx
  };

  const swapResponse = await jupiter.swapPost(swapRequest);

  if (!swapResponse.swapTransaction) {
    throw new Error('❌ Swap transaction not returned from Jupiter API');
  }

  // 3. Deserialize, sign, and send
  const tx = Transaction.from(
    Buffer.from(swapResponse.swapTransaction, 'base64')
  );
  tx.partialSign(payer);

  const signature = await sendAndConfirmRawTransaction(
    connection,
    tx.serialize(),
    {
      skipPreflight: false,
    }
  );
  console.log('✅ Swap succeeded. Tx:', signature);
}

export default swapSolToToken;
