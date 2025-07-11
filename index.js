import 'dotenv/config'
import { setupBot } from './telegram.js'
import { initTradeLoop } from './tradeEngine.js'

setupBot()
initTradeLoop()
