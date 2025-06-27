'use client';

import { useState } from 'react';

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [balances] = useState({
    diaTokenBalance: '0',
    dappTokenBalance: '0',
    tokenFarmBalance: '0',
  });

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement staking logic
    console.log('Staking:', amount);
    setTimeout(() => {
      setLoading(false);
      setAmount(0);
    }, 2000);
  };

  const handleUnstake = async () => {
    setLoading(true);
    // TODO: Implement unstaking logic
    console.log('Unstaking');
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">DF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DeFi Token Farm</span>
            </div>
            <div className="text-sm text-gray-600">
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Staking Balance</h3>
            <p className="text-3xl font-bold text-blue-600">
              {balances.tokenFarmBalance} <span className="text-sm text-gray-500">mDIA</span>
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reward Balance</h3>
            <p className="text-3xl font-bold text-green-600">
              {balances.dappTokenBalance} <span className="text-sm text-gray-500">DAPP</span>
            </p>
          </div>
        </div>

        {/* Staking Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Stake Tokens</h2>
          </div>

          <form onSubmit={handleStake} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">From</label>
                <span className="text-sm text-gray-500">
                  Balance: {balances.diaTokenBalance} DIA
                </span>
              </div>
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 text-xl font-medium border-none outline-none bg-transparent"
                />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">DIA</span>
                  </div>
                  <span className="font-medium">DIA</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {account ? (
                <>
                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {loading ? 'Processing...' : 'STAKE!'}
                  </button>
                  <button
                    type="button"
                    onClick={handleUnstake}
                    disabled={loading}
                    className="w-full bg-transparent border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {loading ? 'Processing...' : 'UN-STAKE'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition duration-200"
                >
                  CONNECT TO METAMASK!
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Connect your MetaMask wallet</li>
            <li>Enter the amount of DIA tokens you want to stake</li>
            <li>Click &quot;STAKE!&quot; to deposit your tokens</li>
            <li>Earn DAPP tokens as rewards over time</li>
            <li>Click &quot;UN-STAKE&quot; to withdraw your tokens and rewards</li>
          </ol>
        </div>
      </main>
    </div>
  );
}