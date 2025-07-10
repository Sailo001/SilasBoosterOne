const { ethers } = require("ethers");
const walletManager = require("./walletManager");
const tradeExecutor = require("./tradeExecutor");

let tradeHistory = [];
let activeToken = null;

async function getTokenBalance(wallet, tokenAddress) {
  if (!tokenAddress || tokenAddress === DAI_ADDRESS) return "0";
  
  const provider = wallet.provider;
  const contract = new ethers.Contract(tokenAddress, [
    "function balanceOf(address owner) view returns (uint256)"
  ], provider);
  
  try {
    const balance = await contract.balanceOf(wallet.address);
    return ethers.formatUnits(balance, 18);
  } catch (err) {
    console.error("Failed to fetch token balance:", err.message);
    return "0";
  }
}

async function calculatePnL() {
  if (!activeToken) return { totalProfit: "0 ETH", trades: 0 };
  
  let totalEthSpent = 0;
  let totalEthGained = 0;
  
  for (const trade of tradeHistory) {
    if (trade.type === "buy") {
      totalEthSpent += parseFloat(trade.amount);
    } else {
      totalEthGained += parseFloat(trade.amount);
    }
  }
  
  const profit = (totalEthGained - totalEthSpent).toFixed(4);
  return {
    totalProfit: `${profit} ETH`,
    trades: tradeHistory.length
  };
}

module.exports = {
  recordTrade: (type, amount) => {
    tradeHistory.push({ type, amount, timestamp: new Date() });
  },
  getTokenBalance,
  calculatePnL,
  setActiveToken: (token) => { activeToken = token; },
  getActiveToken: () => activeToken
}
