import { createSolanaRpc, address } from '@solana/kit';

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// async function main() {
//   const addrStr = process.argv[2];

//   if (!addrStr) {
//     console.error('❌ Please provide a Solana address as an argument.');
//     process.exit(1);
//   }

//   if (addrStr.startsWith('0x')) {
//     console.error(
//       '❌ This looks like an Ethereum address. Please use a Solana address.'
//     );
//     process.exit(1);
//   }

//   let addr;
//   try {
//     addr = address(addrStr); // ✅ must be outside of the inner try block
//   } catch (err) {
//     console.error('❌ Invalid address format:', err.message);
//     process.exit(1);
//   }

//   try {
//     const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');
//     const resp = await rpc.getAccountInfo(addr).send();

//     if (!resp.value) {
//       console.log('❌ Address not found on Solana.');
//     } else if (resp.value.executable) {
//       console.log('✅ Address is a Solana program (contract).');
//     } else {
//       console.log('ℹ️ Address exists but is not executable (not a contract).');
//     }
//   } catch (err) {
//     console.error('❌ RPC Error:', err.message);
//   }
// }

// main();

const addrStr = process.argv[2];

if (!addrStr) {
  console.error('❌ Provide a Solana address as an argument');
  process.exit(1);
}

if (addrStr.startsWith('0x')) {
  console.error(
    '❌ This looks like an Ethereum address. Use a Solana address.'
  );
  process.exit(1);
}

async function main() {
  try {
    const address = new PublicKey(addrStr);
    const connection = new Connection(
      clusterApiUrl('mainnet-beta'),
      'confirmed'
    );

    const accountInfo = await connection.getAccountInfo(address);

    if (!accountInfo) {
      console.log('❌ Address not found on Solana.');
    } else if (accountInfo.executable) {
      console.log('✅ Address is a Solana contract (program).');
    } else {
      console.log('ℹ️ Address exists but is not executable (likely a wallet).');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
