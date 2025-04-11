import { BrowserProvider } from 'ethers';

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider;
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}
