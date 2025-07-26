import {
  Keypair,
  PublicKey,
  Connection,
  clusterApiUrl,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { createJupiterApiClient } from '@jup-ag/api';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY_BASE58;

const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
const connection = new Connection(clusterApiUrl('mainnet-beta'), {
  commitment: 'confirmed',
});

const jupiter = createJupiterApiClient({
  basePath: 'https://lite-api.jup.ag/swap/v1',
});

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
    inputMint: tokenMint,
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: balance.toString(),
    slippageBps: 100,
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
