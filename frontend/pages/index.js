'use client';

import { BrowserProvider } from 'ethers';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const handleLogin = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      try {
        const signature = await signer.signMessage(address);
        console.log(signature);
        localStorage.setItem('Wallet_address', address);
        router.push('/login-as');
      } catch (error) {
        console.log('Login Rejected');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 text-gray-900 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Token Staking DApp
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Stake your WETH and earn passive rewards in ZCoin. Transparent,
          decentralized, and secure.
        </p>
        <button
          onClick={handleLogin}
          className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-400 shadow-xl transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <span className="relative text-lg font-semibold text-white flex items-center gap-2">
            <span role="img" aria-label="lock">🔐</span>
            Connect with MetaMask
          </span>
        </button>
      </div>
    </div>
  );
};

export default Login;
