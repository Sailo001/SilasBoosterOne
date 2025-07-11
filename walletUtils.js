import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL)

const privateKeys = [
  process.env.WALLET_MAIN_PK,
  process.env.WALLET_1_PK,
  process.env.WALLET_2_PK
]

export const wallets = privateKeys.map(pk => new ethers.Wallet(pk, provider))

let rotateIndex = 0
export function getNextWallet() {
  const wallet = wallets[rotateIndex % wallets.length]
  rotateIndex++
  return wallet
