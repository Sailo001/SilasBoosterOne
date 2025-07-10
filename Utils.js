const { ethers } = require('ethers');

function toWei(amount) {
  return ethers.parseEther(amount.toString());
}

function fromWei(amount) {
  return ethers.formatEther(amount.toString());
}

module.exports = { toWei, fromWei };
