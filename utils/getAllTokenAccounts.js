import bs58 from 'bs58';
import dotenv from 'dotenv';
import { Keypair, PublicKey } from '@solana/web3.js';

import connection from './connection.js';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY_BASE58;

const secretKey = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
const _pubkey = secretKey.publicKey.toBase58();

async function getAllTokenAccounts() {
  const pubkey = new PublicKey(_pubkey);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  });

  return tokenAccounts.value.map((acc) => {
    const parsed = acc.account.data.parsed;

    console.log(parsed, '\n');

    return {
      mint: parsed.info.mint,
      amount: parsed.info.tokenAmount.uiAmount,
      decimals: parsed.info.tokenAmount.decimals,
    };
  });
}

export default getAllTokenAccounts;
