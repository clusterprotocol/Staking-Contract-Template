import { BrowserProvider, ethers } from 'ethers';
import contractAddress from '../contracts/Staking-address.json';
import StakingAbi from '../contracts/Staking-abi.json';
// Replace with the path to your contract's JSON file

async function getContract() {
  try {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const contractABI = Array.isArray(StakingAbi) ? StakingAbi : StakingAbi.abi;
    const Contract = new ethers.Contract(
      contractAddress.address,
      contractABI,
      signer
    );
    return Contract;
  } catch (error) {
    console.error('Error getting Contract:', error);
  }
}
export { getContract };
