import { StatsOverviewProps } from '@/types';

export default function StatsOverview({ balances, stakingData }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Your DIA Balance</h3>
        <p className="text-2xl font-bold text-blue-600">
          {balances.diaTokenBalance} <span className="text-sm text-gray-500">DIA</span>
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Staked Amount</h3>
        <p className="text-2xl font-bold text-purple-600">
          {balances.tokenFarmBalance} <span className="text-sm text-gray-500">DIA</span>
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Rewards Earned</h3>
        <p className="text-2xl font-bold text-green-600">
          {balances.dappTokenBalance} <span className="text-sm text-gray-500">DAPP</span>
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Current APR</h3>
        <p className="text-2xl font-bold text-yellow-600">
          {stakingData.apr}% <span className="text-sm text-gray-500">APR</span>
        </p>
      </div>
    </div>
  );
}