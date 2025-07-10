require('dotenv').config();

// Load modules
const bot = require('./bot');
const tradeExecutor = require('./tradeExecutor');

// Initialize executor with bot
tradeExecutor.init(bot);

// Optional: Log server start
const PORT = process.env.PORT || 3000;
console.log(`Service running on port ${PORT}`);
