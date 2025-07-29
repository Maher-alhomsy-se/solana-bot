const fetchTokenInfo = async (tokenMint) => {
  const resp = await fetch(
    `https://lite-api.jup.ag/tokens/v2/search?query=${tokenMint}`
  );

  const data = await resp.json();

  return data[0];
};

export default fetchTokenInfo;
