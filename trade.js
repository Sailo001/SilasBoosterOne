const axios = require("axios");
const { ethers } = require("ethers");

async function swapToken({
  fromWallet, 
  buyToken, 
  sellToken = "ETH", 
  amountETH, 
  isBuy = true
}) {
  try {
    if (isBuy) {
      // 0x Swap: ETH -> ERC20 buy
      const swapUrl = `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${ethers.utils.parseEther(amountETH + "")}&takerAddress=${fromWallet.address}`;
      const { data } = await axios.get(swapUrl);

      const tx = {
        to: data.to,
        data: data.data,
        value: data.value,
        gasPrice: data.gasPrice,
        gasLimit: ethers.BigNumber.from("350000"),
      };

      const receipt = await fromWallet.sendTransaction(tx);
      return receipt;
    }
    // For sells, switch buy/sell tokens above
  } catch (e) {
    throw new Error("Trade failed: " + e.message);
  }
}

module.exports = { swapToken }
