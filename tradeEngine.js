import axios from 'axios'
import { getNextWallet, wallets } from './walletUtils.js'

let currentToken = null
let interval = null
let tradeCount = 0
let volume = 0
let trading = false

export function reviveToken(token) {
  currentToken = token
  trading = true
  tradeCount = 0
  volume = 0
}

export function stopTrading() {
  trading = false
  clearInterval(interval)
}

export function getStatus() {
  return `🔁 Trades: ${tradeCount}\n💸 Volume: ${volume.toFixed(4)} ETH\n📦 Token: ${currentToken || 'None'}`
}

export function sellAll() {
  wallets.forEach(w => {
    console.log(`Would sell all token from wallet ${w.address}...`)
    // simulate selling
  })
}

export function initTradeLoop() {
  interval = setInterval(async () => {
    if (!trading || !currentToken) return

    const wallet = getNextWallet()
    try {
      const amountInEth = '0.0005'
      const ethAmount = (BigInt(Math.floor(parseFloat(amountInEth) * 1e18))).toString()

      const quoteUrl = `https://api.0x.org/swap/v1/quote`
      const res = await axios.get(quoteUrl, {
        params: {
          sellToken: 'ETH',
          buyToken: currentToken,
          sellAmount: ethAmount,
          takerAddress: wallet.address
        }
      })

      const tx = res.data
      const sent = await wallet.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value || 0),
        gasLimit: BigInt(300000)
      })

      console.log(`✅ Trade sent: ${sent.hash} (${wallet.address})`)
      volume += parseFloat(amountInEth)
      tradeCount++
    } catch (e) {
      console.log(`❌ Error in trade: ${e.message}`)
    }
  }, 20000)
