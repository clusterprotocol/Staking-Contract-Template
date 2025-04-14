'use client';

import { useEffect, useState } from 'react';
import {
  getStakeInfo,
  calculateReward,
  stakeTokens,
  initiateUnstake,
  withdraw,
  getFormattedRewardBalance,
} from '@/utils/helpers';
import { formatUnits, parseUnits } from 'ethers';

export default function DashboardPage() {
  const [amountToStake, setAmountToStake] = useState('');
  const [stakeInfo, setStakeInfo] = useState({});
  const [reward, setReward] = useState('0');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [rewardBalance, setRewardBalance] = useState('');

  const fetchStakeData = async () => {
    try {
      const info = await getStakeInfo();
      const pending = await calculateReward();
      console.log(info);
      setStakeInfo(info);
      setReward(pending.toString());
    } catch (err) {
      console.error('Error fetching stake info:', err);
    }
  };

  const handleStake = async () => {
    setLoading(true);
    setTxStatus('Staking in progress...');
    try {
      const amt = parseUnits(amountToStake.toString(), 18);
      await stakeTokens(amt);
      setAmountToStake('');
      await fetchStakeData();
      setTxStatus('✅ Successfully staked!');
    } catch (err) {
      console.error(err.reason);
      setTxStatus(`❌ ${err.reason}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    setLoading(true);
    setTxStatus('Initiating unstake...');
    try {
      await initiateUnstake();
      await fetchStakeData();
      setTxStatus('✅ Cooldown started!');
    } catch (err) {
      console.error(err.reason);
      setTxStatus(`❌ ${err.reason}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setTxStatus('Processing withdrawal...');
    try {
      await withdraw();
      await fetchStakeData();
      setTxStatus('✅ Withdrawn successfully!');
    } catch (err) {
      console.error(err);
      console.log(err.reason);
      setTxStatus(`❌ ${err.reason}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakeData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const balance = await getFormattedRewardBalance();
        setRewardBalance(balance);
      } catch (err) {
        console.error('Error fetching reward token balance:', err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📊 Staking Dashboard
        </h1>

        {/* Stake Form */}
        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            Amount to Stake
          </label>
          <input
            type="number"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
            placeholder="Enter token amount"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleStake}
            disabled={loading}
            className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
          >
            {loading ? 'Staking...' : 'Stake WETH'}
          </button>
        </div>

        {/* Stake Details */}
        <div className="bg-yellow-100 rounded-xl p-4 text-gray-800 space-y-2">
          <p>
            <strong>Staked Amount:</strong>{' '}
            {stakeInfo.amount ? formatUnits(stakeInfo.amount, 18) : '0'}
          </p>
          <p>
            <strong>Last Claimed At:</strong>{' '}
            {stakeInfo?.lastClaimedAt
              ? new Date(
                  parseInt(stakeInfo.lastClaimedAt) * 1000
                ).toLocaleString()
              : 'N/A'}
          </p>
          <p>
            <strong>Pending Reward:</strong>{' '}
            {reward ? formatUnits(reward, 18) : '0'}
          </p>
          <p>
            <strong>Cooldown Started:</strong>{' '}
            {stakeInfo?.cooldownStart && stakeInfo.cooldownStart !== '0'
              ? new Date(
                  parseInt(stakeInfo.cooldownStart) * 1000
                ).toLocaleString()
              : 'Not started'}
          </p>
          <p>
            <strong>ZCoin Balance:</strong>{' '}
            {rewardBalance ? rewardBalance : '0'}
          </p>
          <br />
          <p>
            <strong>ZCoin Contract Address:</strong>{' '}
            0x7711a7CcAF661310882D0462b1379349f316Af0a
          </p>
          <p>
            (please add the above token address to your metamask to view your
            rewards)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleUnstake}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Initiate Unstake'}
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>

        {/* Tx Status */}
        {txStatus && (
          <p className="mt-4 text-center text-sm text-gray-600">{txStatus}</p>
        )}
      </div>
    </div>
  );
}
