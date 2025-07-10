require('dotenv').config();
const { ethers } = require("ethers");
const axios = require("axios");

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI Token

let tradeInterval = null;
let activeToken = null;

async function init(bot) {
  console.log("Trade executor initialized!");

  // Start dummy trading loop
  tradeInterval = setInterval(async () => {
    if (!activeToken) return;

    const wallet = walletManager.getNextWallet();
    const ethBalance = await wallet.getBalance();
    const ethBalanceStr = ethers.formatEther(ethBalance);

    if (parseFloat(ethBalanceStr) < 0.1) {
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ Low ETH in wallet: ${wallet.address}`);
      return;
    }

    // Buy phase
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `🛒 Buying token: ${activeToken}`);
    await executeTrade(wallet, activeToken, true);

    // Sell phase after delay
    setTimeout(async () => {
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `📉 Selling token: ${activeToken}`);
      await executeTrade(wallet, activeToken, false);
    }, 10000); // 10 seconds between buy and sell

  }, 20000); // Every 20 seconds

  bot.onText(/\/stop/, () => {
    clearInterval(tradeInterval);
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "🛑 Auto-trading stopped.");
  });

  bot.onText(/\/revive (.+)/, (msg, match) => {
    activeToken = match[1];
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `🔥 Pumping token: ${activeToken}`);
  });
}

async function executeTrade(wallet, tokenAddress, isBuy) {
  try {
    const side = isBuy ? "buy" : "sell";
    const fromToken = isBuy ? DAI_ADDRESS : tokenAddress;
    const toToken = isBuy ? tokenAddress : DAI_ADDRESS;

    const url = `https://api.0x.org/swap/v1/quote?`;
    const params = new URLSearchParams({
      chainId: "1",
      fromToken,
      toToken,
      amount: ethers.parseEther("0.01").toString(),
      fromAddress: wallet.address,
      slippagePercentage: "0.1"
    });

    const response = await axios.get(url + params);
    const transaction = response.data;

    const tx = await wallet.sendTransaction({
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gas
    });

    console.log(`Submitted ${side} tx:`, tx.hash);
    return tx;
  } catch (error) {
    console.error("Trade execution failed:", error.message);
    return null;
  }
}

module.exports = { init };
