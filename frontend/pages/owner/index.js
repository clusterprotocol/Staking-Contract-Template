'use client';

import { useEffect, useState } from 'react';
import {
  getAPY,
  getCooldownPeriod,
  isOwner,
  setAPY,
  setCooldownPeriod,
} from '@/utils/helpers';

export default function OwnerDashboard() {
  const [apy, setApyVal] = useState('');
  const [cooldown, setCooldownVal] = useState('');
  const [isContractOwner, setIsContractOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const ownerCheck = await isOwner();
        setIsContractOwner(ownerCheck);

        const currentAPY = await getAPY();
        const currentCooldown = await getCooldownPeriod();

        setApyVal(currentAPY.toString());
        setCooldownVal(currentCooldown.toString());
      } catch (error) {
        console.error('Error fetching owner details:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAPYUpdate = async () => {
    setTxStatus('Updating APY...');
    try {
      await setAPY(apy);
      setTxStatus('✅ APY updated');
    } catch (err) {
      console.error(err);
      setTxStatus('❌ Failed to update APY');
    }
  };

  const handleCooldownUpdate = async () => {
    setTxStatus('Updating cooldown period...');
    try {
      await setCooldownPeriod(cooldown);
      setTxStatus('✅ Cooldown period updated');
    } catch (err) {
      console.error(err);
      setTxStatus('❌ Failed to update cooldown');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!isContractOwner) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        🚫 You are not the contract owner.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🛠️ Owner Dashboard
        </h1>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">APY (basis points)</label>
          <input
            type="number"
            value={apy}
            onChange={(e) => setApyVal(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={handleAPYUpdate}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
          >
            Update APY
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Cooldown Period (in seconds)</label>
          <input
            type="number"
            value={cooldown}
            onChange={(e) => setCooldownVal(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={handleCooldownUpdate}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
          >
            Update Cooldown Period
          </button>
        </div>

        {txStatus && <p className="text-center text-sm text-gray-600 mt-4">{txStatus}</p>}
      </div>
    </div>
  );
}
