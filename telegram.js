import TelegramBot from 'node-telegram-bot-api'
import { reviveToken, sellAll, getStatus, stopTrading } from './tradeEngine.js'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

export function setupBot() {
  bot.onText(/\/start/, (msg) => {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📈 Revive Token', callback_data: 'revive_prompt' }],
          [{ text: '💰 Sell All', callback_data: 'sell_all' }],
          [{ text: '📊 Status', callback_data: 'status' }],
          [{ text: '🛑 Stop', callback_data: 'stop' }]
        ]
      }
    }
    bot.sendMessage(msg.chat.id, '🤖 BoosterBot Online. Choose an action:', keyboard)
  })

  bot.onText(/\/revive (0x[a-fA-F0-9]{40})/, (msg, match) => {
    const token = match[1]
    reviveToken(token)
    bot.sendMessage(msg.chat.id, `🚀 Starting pump for ${token}`)
  })

  bot.onText(/\/sell all/, (msg) => {
    sellAll()
    bot.sendMessage(msg.chat.id, `🧨 Selling all tokens from all wallets.`)
  })

  bot.onText(/\/status/, (msg) => {
    bot.sendMessage(msg.chat.id, getStatus())
  })

  bot.onText(/\/stop/, (msg) => {
    stopTrading()
    bot.sendMessage(msg.chat.id, `⛔️ Trading stopped.`)
  })

  bot.on('callback_query', query => {
    const { id, data, message } = query
    if (data === 'sell_all') sellAll()
    if (data === 'status') bot.sendMessage(message.chat.id, getStatus())
    if (data === 'stop') stopTrading()
    if (data === 'revive_prompt') bot.sendMessage(message.chat.id, 'Send `/revive <TOKEN_ADDRESS>` to begin.')
    bot.answerCallbackQuery(id)
  })
