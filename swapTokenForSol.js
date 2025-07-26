import {
  PublicKey,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

import { connection, jupiter, payer } from './config/jupiter.js';

async function getTokenBalance(tokenMint) {
  const ata = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    payer.publicKey
  );

  try {
    const account = await getAccount(connection, ata);
    return account.amount;
  } catch (e) {
    console.log(`⚠️ No associated token account found for ${tokenMint}`);
    return 0n;
  }
}

async function swapTokenToSol(tokenMint) {
  const balance = await getTokenBalance(tokenMint);

  if (balance === 0n) {
    console.log(`❌ No ${tokenMint} tokens to swap.`);
    return;
  }

  console.log(`🔁 Swapping ${Number(balance) / 1e6} ${tokenMint} to SOL`);

  const quoteResponse = await jupiter.quoteGet({
    slippageBps: 100,
    inputMint: tokenMint,
    amount: balance.toString(),
    outputMint: 'So11111111111111111111111111111111111111112',
  });

  if (!quoteResponse || !quoteResponse.outAmount) {
    console.log('❌ No swap route found.');
    return;
  }

  const userPublicKey = payer.publicKey.toBase58();

  const swapRes = await jupiter.swapPost({
    swapRequest: { quoteResponse, userPublicKey, wrapAndUnwrapSol: true },
  });

  if (!swapRes.swapTransaction) {
    throw new Error('❌ Swap transaction not returned from Jupiter API');
  }

  const serializedTx = Buffer.from(swapRes.swapTransaction, 'base64');
  const tx = VersionedTransaction.deserialize(serializedTx);
  tx.sign([payer]);

  const sig = await sendAndConfirmRawTransaction(connection, tx.serialize());
  console.log(`✅ Sold ${tokenMint} for SOL. Tx: ${sig}`);

  return sig;
}

export default swapTokenToSol;
