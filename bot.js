require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { startPump, sellAll, getBotStatus, stopTrading } = require('./trader');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔥 Start Pump', callback_data: 'start_pump' }],
        [{ text: '💸 Sell All', callback_data: 'sell_all' }],
        [{ text: '📊 Status', callback_data: 'status' }],
        [{ text: '🛑 Stop', callback_data: 'stop' }]
      ]
    }
  };
  bot.sendMessage(chatId, 'Welcome to Silas Booster One!', options);
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  
  switch(query.data) {
    case 'start_pump':
      bot.sendMessage(chatId, "Enter token address to revive:");
      bot.once('message', (msg) => startPump(bot, msg.text));
      break;
      
    case 'sell_all':
      await sellAll(bot);
      break;
      
    case 'status':
      await getBotStatus(bot);
      break;
      
    case 'stop':
      await stopTrading(bot);
      break;
  }
});

// Handle direct commands
bot.onText(/\/revive (.+)/, async (msg, match) => {
  const tokenAddress = match[1];
  await startPump(bot, tokenAddress);
});

bot.onText(/\/sell all/, async (msg) => {
  await sellAll(bot);
});

bot.onText(/\/status/, async (msg) => {
  await getBotStatus(bot);
});

bot.onText(/\/stop/, async (msg) => {
  await stopTrading(bot);
});
