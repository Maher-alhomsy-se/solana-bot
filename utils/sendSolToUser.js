import {
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import { connection, payer } from '../config/jupiter';

const senderWallet = payer;

async function sendSolToUser(toAddress, amount) {
  const recipient = new PublicKey(toAddress);
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL); // Convert to lamports

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderWallet.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderWallet,
  ]);

  console.log(`✅ Send ${amount} Sol to ${toAddress}`);

  return signature;
}

export default sendSolToUser;
