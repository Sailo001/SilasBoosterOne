require('dotenv').config();
const bot = require('./bot');
const tradeEngine = require('./tradeEngine');

const PORT = process.env.PORT || 3000;
require('http').createServer(() => {}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.init(tradeEngine);
tradeEngine.init(bot);
