const { ethers } = require("ethers");
require('dotenv').config();

class WalletManager {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

    this.wallets = {
      main: new ethers.Wallet(process.env.WALLET_MAIN_PK, this.provider),
      wallet1: new ethers.Wallet(process.env.WALLET_1_PK, this.provider),
      wallet2: new ethers.Wallet(process.env.WALLET_2_PK, this.provider)
    };

    this.rotationIndex = 0;
    this.rotationOrder = ['main', 'wallet1', 'wallet2'];
  }

  getNextWallet() {
    const walletName = this.rotationOrder[this.rotationIndex];
    this.rotationIndex = (this.rotationIndex + 1) % this.rotationOrder.length;
    return this.wallets[walletName];
  }
}

module.exports = new WalletManager();
