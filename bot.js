require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🚀 Silas Booster One is ready!\n\nUse /revive <token> to start a pump.");
});

bot.onText(/\/revive (.+)/, (msg, match) => {
  const tokenAddress = match[1];
  bot.sendMessage(msg.chat.id, `🔥 Starting pump for token: ${tokenAddress}`);
  // You can trigger actual trading here if needed
});

module.exports = bot;
