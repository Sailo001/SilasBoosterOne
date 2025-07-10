const TelegramBot = require('node-telegram-bot-api');
const chatId = process.env.TELEGRAM_CHAT_ID;
let tradeEngineRef = null;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

function init(tradeEngine) {
  tradeEngineRef = tradeEngine;

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome! Use the inline keyboard below.', {
      reply_markup: {
        keyboard: [
          ['/revive <token>'],
          ['/sell all'],
          ['/status'],
          ['/stop']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  });

  bot.onText(/\/revive (.+)/, (msg, match) => {
    const token = match[1];
    tradeEngineRef.startPump(token);
    bot.sendMessage(msg.chat.id, `Pumping started for token: ${token}`);
  });

  bot.onText(/\/sell all/, (msg) => {
    tradeEngineRef.sellAll();
    bot.sendMessage(msg.chat.id, 'Selling all token balances from all wallets...');
  });

  bot.onText(/\/status/, (msg) => {
    const status = tradeEngineRef.getStatus();
    bot.sendMessage(msg.chat.id, status);
  });

  bot.onText(/\/stop/, (msg) => {
    tradeEngineRef.stop();
    bot.sendMessage(msg.chat.id, 'Auto-trading stopped.');
  });
}

function alert(message) {
  bot.sendMessage(chatId, message);
}

module.exports = { init, alert };
