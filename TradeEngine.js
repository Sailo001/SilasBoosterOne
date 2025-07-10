const axios = require('axios');
const walletManager = require('./walletManager');
const utils = require('./utils');

let botRef = null;
let running = false;
let intervalId = null;
let currentToken = null;
let tradeCount = 0;
let totalVolume = 0;
let pnl = 0;

function init(bot) {
  botRef = bot;
}

async function trade(tokenAddress, action = 'buy') {
  const wallet = walletManager.getNextWallet();
  const ethBalance = await wallet.provider.getBalance(wallet.address);

  if (ethBalance < utils.toWei('0.01')) {
    botRef.alert(`Low ETH on wallet ${wallet.address}. Skipping trade.`);
    return;
  }

  const tradeAmount = utils.toWei('0.005'); // Micro trade
  const side = action === 'buy' ? 'buy' : 'sell';

  try {
    const swapUrl = `https://api.0x.org/swap/v1/quote?buyToken=${tokenAddress}&sellToken=ETH&buyAmount=${tradeAmount}`;
    const { data } = await axios.get(swapUrl);

    const tx = {
      to: data.to,
      data: data.data,
      value: ethers.BigNumber.from(data.value || '0')
    };

    const txResponse = await wallet.sendTransaction(tx);
    await txResponse.wait();

    tradeCount++;
    totalVolume += parseFloat(utils.fromWei(tradeAmount));
    botRef.alert(`Trade #${tradeCount}: ${side} ${utils.fromWei(tradeAmount)} ETH of ${tokenAddress} from ${wallet.address}`);
  } catch (err) {
    botRef.alert(`Trade failed: ${err.message}`);
  }
}

function startPump(token) {
  if (running) stop();
  currentToken = token;
  running = true;
  intervalId = setInterval(() => trade(token, 'buy'), 20000);
  botRef.alert(`Pump started for token: ${token}`);
}

function sellAll() {
  // For each wallet, sell all token balances (simplified for brevity)
  walletManager.getAllWallets().forEach(async (wallet) => {
    // Implement token balance check and 0x API sell logic here
    botRef.alert(`Selling all tokens from ${wallet.address} (implement logic)`);
  });
}

function getStatus() {
  return `Trades: ${tradeCount}\nTotal Volume: ${totalVolume} ETH\nPnL (est.): ${pnl} ETH\nCurrent Token: ${currentToken}`;
}

function stop() {
  if (intervalId) clearInterval(intervalId);
  running = false;
  botRef.alert('Pump stopped.');
}

module.exports = { init, startPump, sellAll, getStatus, stop };
