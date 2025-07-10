const { ethers } = require("ethers");

function loadWallets() {
  const pkList = [
    process.env.WALLET_MAIN_PK,
    process.env.WALLET_1_PK,
    process.env.WALLET_2_PK,
  ].filter(Boolean);

  return pkList.map(
    (pk) => new ethers.Wallet(pk, new ethers.providers.JsonRpcProvider(process.env.INFURA_URL))
  );
}

module.exports = { loadWallets }
