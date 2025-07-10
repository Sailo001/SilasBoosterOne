const TelegramBot = require("node-telegram-bot-api");
const { swapToken } = require("./trade");
const { loadWallets } = require("./wallet");
const { reportPnL } = require("./utils");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let isRunning = false, currentToken = null, tradeInterval = null;
const wallets = loadWallets();
let activeIdx = 0, trades = [];

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Use /revive <token>, /sell all, /status, /stop");
});

bot.onText(/\/revive (0x[a-fA-F0-9]{40})/, (msg, match) => {
  currentToken = match[1];
  isRunning = true;
  bot.sendMessage(msg.chat.id, `Pumping: ${currentToken}`);
  startPumping();
});

function startPumping() {
  if(tradeInterval) clearInterval(tradeInterval);
  tradeInterval = setInterval(async () => {
    const w = wallets[activeIdx % wallets.length];
    activeIdx++;
    try {
      const receipt = await swapToken({
        fromWallet: w,
        buyToken: currentToken,
        amountETH: 0.01, // Micro trade, adjust as needed
        isBuy: true
      });
      trades.push(receipt);
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `Bought via ${w.address}: Tx ${receipt.hash}`);
    } catch(e) {
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "Trade error: " + e.message);
    }
  }, 20 * 1000);
}

bot.onText(/\/stop/, () => {
  isRunning = false;
  clearInterval(tradeInterval);
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "Pump stopped.");
});

bot.onText(/\/status/, async () => {
  // Show basic stats
  const pnl = await reportPnL(wallets, currentToken, trades);
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `Stats:\n${pnl}`);
});

bot.onText(/\/sell all/, async () => {
  // Loop all wallets, sell all token
  for (const w of wallets) {
    // Implement selling logic...
  }
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "Attempted to sell all tokens.");
});

module.exports = bot
