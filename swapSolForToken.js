import {
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';

import fetchTokenInfo from './utils/fetchTokenInfo.js';
import getSolUsdPrice from './utils/getSolUsdPrice.js';
import { jupiter, payer, connection } from './config/jupiter.js';

async function swapSolToToken(tokenMint) {
  const solUsdPrice = await getSolUsdPrice();

  console.log('Sol Price in USD ', solUsdPrice);

  if (!solUsdPrice) {
    console.error('❌ Failed to fetch SOL/USD price');
    return;
  }

  const fiveUsdInSol = 5 / solUsdPrice;
  const fiveUsdInLamports = Math.floor(fiveUsdInSol * 1e9);

  const balance = await connection.getBalance(payer.publicKey);

  if (balance < fiveUsdInLamports) {
    console.log('⚠️ Balance is less than $5 in SOL');
    return;
  }

  const quoteResponse = await jupiter.quoteGet({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: tokenMint,
    amount: fiveUsdInLamports.toString(),
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

  const { name, symbol } = await fetchTokenInfo(tokenMint);

  return { signature, name, symbol };
}

export default swapSolToToken;
