import { StatsOverviewProps } from '@/types';

export default function StakingOverview({ balances, stakingData }: StatsOverviewProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📊 Staking Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-sm text-gray-600">Daily Rewards</div>
          <div className="text-lg font-bold text-blue-600">{stakingData.dailyReward} DAPP/day</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-sm text-gray-600">Your Staked</div>
          <div className="text-lg font-bold text-purple-600">{balances.tokenFarmBalance} DIA</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Pool</div>
          <div className="text-lg font-bold text-indigo-600">{stakingData.totalStaked} DIA</div>
        </div>
      </div>
    </div>
  );
}