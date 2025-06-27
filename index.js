import swapSolToToken from './swapSolForToken.js';
import validateAddress from './validateAddress.js';
import getTokenMetricsFromDexscreener from './getTokenMetricsFromDexscreener.js';

const addrStr = 'HJTTpPSzHixQNMjKPht3W4XKyY8Ncv7bQB6xwmLu2jnz';

async function main() {
  const validation = await validateAddress(addrStr);

  if (!validation.valid) {
    console.error('❌ Invalid or non-existent Solana address');
    return;
  }

  try {
    const { fdv } = await getTokenMetricsFromDexscreener(addrStr);

    if (fdv > 50000) {
      console.log(
        '🚀 FDV is high. Attempting to buy 0.05 SOL of this token...'
      );
      await swapSolToToken(addrStr);
    }
  } catch (error) {
    console.log('Error in FDV');

    console.log(error);
  }
}

main();
