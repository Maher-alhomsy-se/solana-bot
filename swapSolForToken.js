import {
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';

import { jupiter, payer, connection } from './config/jupiter.js';

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

  return signature;
}

export default swapSolToToken;
