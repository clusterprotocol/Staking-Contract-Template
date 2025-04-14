import { ethers } from 'ethers';
import { getContract } from './utils';
import { getSigner, getProvider } from './web3';

const REWARD_TOKEN_ADDRESS =  '0x7711a7CcAF661310882D0462b1379349f316Af0a'; // 🔁 Replace this
const REWARD_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export async function getStakeInfo() {
  const contract = await getContract();
  const signer = await getSigner();
  const address = await signer.getAddress();
  return await contract.stakes(address);
}

export async function calculateReward() {
  const contract = await getContract();
  const signer = await getSigner();
  const address = await signer.getAddress();
  return await contract.calculateReward(address);
}

export async function stakeTokens(amount) {
  const contract = await getContract();
  const signer = await getSigner();
  const tokenAddress = await contract.stakingToken();

  const erc20 = new ethers.Contract(
    tokenAddress,
    [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
    ],
    signer
  );

  const userAddress = await signer.getAddress();
  const wethBalance = await erc20.balanceOf(userAddress);
  console.log(wethBalance.toString());

  const approveTx = await erc20.approve(contract.target, amount);
  await approveTx.wait();

  const stakeTx = await contract.stake(amount);
  await stakeTx.wait();
}

export async function initiateUnstake() {
  const contract = await getContract();
  const tx = await contract.initiateUnstake();
  await tx.wait();
}

export async function withdraw() {
  const contract = await getContract();
  const tx = await contract.withdraw();
  await tx.wait();
}

export async function getAPY() {
  const contract = await getContract();
  return await contract.apy();
}

export async function getCooldownPeriod() {
  const contract = await getContract();
  return await contract.cooldownPeriod();
}

export async function isOwner() {
  const contract = await getContract();
  const owner = await contract.owner();
  const signer = await getSigner();
  const address = await signer.getAddress();
  return owner.toLowerCase() === address.toLowerCase();
}

export async function setAPY(newAPY) {
  const contract = await getContract();
  const tx = await contract.setAPY(newAPY);
  await tx.wait();
}

export async function setCooldownPeriod(seconds) {
  const contract = await getContract();
  const tx = await contract.setCooldownPeriod(seconds);
  await tx.wait();
}

// 🔥 NEW — get raw reward token balance
export async function getRewardTokenBalance() {
  const provider = await getProvider();
  const signer = await getSigner();
  const address = await signer.getAddress();

  const token = new ethers.Contract(REWARD_TOKEN_ADDRESS, REWARD_TOKEN_ABI, provider);
  return await token.balanceOf(address);
}

// 🔥 NEW — get formatted reward balance
export async function getFormattedRewardBalance() {
  const raw = await getRewardTokenBalance();
  return ethers.formatUnits(raw, 18);
}
