const { ethers } = require('ethers');

const walletPKs = [
  process.env.WALLET_MAIN_PK,
  process.env.WALLET_1_PK,
  process.env.WALLET_2_PK
];

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

let walletIndex = 0;

function getNextWallet() {
  walletIndex = (walletIndex + 1) % walletPKs.length;
  return new ethers.Wallet(walletPKs[walletIndex], provider);
}

function getAllWallets() {
  return walletPKs.map(pk => new ethers.Wallet(pk, provider));
}

module.exports = { getNextWallet, getAllWallets };
