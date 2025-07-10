const tradeExecutor = require("./tradeExecutor");
const walletManager = require("./walletManager");
const analytics = require("./analytics");
const { ethers } = require("ethers");

let pumpInterval = null;
let activeToken = null;
let tradingEnabled = true;

async function startPump(bot, tokenAddress) {
  if (!tokenAddress || tokenAddress.trim() === "") {
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "❌ Invalid token address provided.");
    return;
  }

  activeToken = tokenAddress;
  analytics.setActiveToken(tokenAddress);
  
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `🚀 Starting pump for token: \`${tokenAddress}\``, { parse_mode: "Markdown" });
  
  if (pumpInterval) clearInterval(pumpInterval);
  
  pumpInterval = setInterval(async () => {
    if (!tradingEnabled) return;
    
    const wallet = walletManager.getNextWallet();
    const ethBalance = await wallet.getBalance();
    
    if (ethers.formatEther(ethBalance) < 0.1) {
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ Low ETH in wallet: ${wallet.address}`);
      return;
    }
    
    // Buy phase
    const buyTx = await tradeExecutor.buyToken(wallet, tokenAddress, "0.02");
    if (buyTx?.hash) {
      analytics.recordTrade("buy", "0.02");
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `✅ Bought | Tx: \`${buyTx.hash}\``, { parse_mode: "Markdown" });
    }
    
    // Sell phase after delay
    setTimeout(async () => {
      const sellTx = await tradeExecutor.sellToken(wallet, tokenAddress, "0.02");
      if (sellTx?.hash) {
        analytics.recordTrade("sell", "0.02");
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `📉 Sold | Tx: \`${sellTx.hash}\``, { parse_mode: "Markdown" });
      }
    }, 10000);
    
  }, 20000); // Every 20 seconds
}

async function sellAll(bot) {
  tradingEnabled = false;
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "🛑 Stopping auto-trading and selling all holdings...");

  const tokenAddress = analytics.getActiveToken();
  if (!tokenAddress) {
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "No active token found.");
    return;
  }

  for (const [name, wallet] of Object.entries(walletManager.wallets)) {
    const balance = await analytics.getTokenBalance(wallet, tokenAddress);
    if (parseFloat(balance) > 0.0001) {
      const sellTx = await tradeExecutor.sellToken(wallet, tokenAddress, balance.toString());
      if (sellTx?.hash) {
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `💼 Sold all from ${name}: \`${sellTx.hash}\``);
      }
    }
  }
}

async function getBotStatus(bot) {
  const balances = await walletManager.getBalances();
  const stats = await analytics.calculatePnL();
  
  let statusMsg = "📊 *Bot Status*\n\n";
  statusMsg += "*Wallet Balances:*\n";
  
  for (const [name, data] of Object.entries(balances)) {
    statusMsg += `- ${name.toUpperCase()}: ${data.eth} ETH (${data.address})\n`;
  }
  
  statusMsg += `\n📈 *Performance*: ${stats.totalProfit} across ${stats.trades} trades`;
  statusMsg += `\n🔄 *Active Token*: ${analytics.getActiveToken() || "None"}`;
  
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, statusMsg, { parse_mode: "Markdown" });
}

async function stopTrading(bot) {
  tradingEnabled = false;
  if (pumpInterval) clearInterval(pumpInterval);
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "🛑 Auto-trading stopped.");
  activeToken = null;
  analytics.setActiveToken(null);
}

module.exports = {
  startPump,
  sellAll,
  getBotStatus,
  stopTrading
}
