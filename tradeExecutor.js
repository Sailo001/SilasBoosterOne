const { ethers } = require("ethers");
const axios = require("axios");
const walletManager = require("./walletManager");

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Example DAI

async function executeTrade(wallet, tokenAddress, isBuy, amountEth = "0.01") {
  try {
    const side = isBuy ? "buy" : "sell";
    const fromToken = isBuy ? DAI_ADDRESS : tokenAddress;
    const toToken = isBuy ? tokenAddress : DAI_ADDRESS;
    
    const url = `https://api.0x.org/swap/v1/quote?`;
    const params = new URLSearchParams({
      chainId: "1",
      fromToken,
      toToken,
      amount: ethers.parseEther(amountEth).toString(),
      fromAddress: wallet.address,
      slippagePercentage: "0.1"
    });
    
    const response = await axios.get(url + params);
    const transaction = response.data;

    const tx = await wallet.sendTransaction({
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gas
    });

    console.log(`Submitted ${side} tx:`, tx.hash);
    return tx;
  } catch (error) {
    console.error("Trade execution failed:", error.message);
    return null;
  }
}

module.exports = {
  buyToken: (wallet, tokenAddress, amountEth) => executeTrade(wallet, tokenAddress, true, amountEth),
  sellToken: (wallet, tokenAddress, amountEth) => executeTrade(wallet, tokenAddress, false, amountEth)
};
