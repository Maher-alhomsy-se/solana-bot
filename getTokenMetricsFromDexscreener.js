import axios from 'axios';

async function getTokenMetricsFromDexscreener(tokenAddress) {
  const URL = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

  const { data } = await axios.get(URL);
  const pairs = data.pairs;

  if (!pairs || pairs.length === 0) {
    throw new Error('No trading pairs found');
  }

  const topPair = pairs[0];
  const fdv = parseFloat(topPair.fdv?.toString() || '0');

  return {
    fdv,
    pairAddress: topPair.pairAddress,
    baseToken: topPair.baseToken.name,
    quoteToken: topPair.quoteToken.name,
  };
}

export default getTokenMetricsFromDexscreener;
