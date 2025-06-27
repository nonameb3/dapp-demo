import { StakeTokensProps } from '@/types';

export default function StakeTokens({ 
  balances, 
  stakeAmount, 
  loading, 
  onStakeAmountChange, 
  onStake 
}: StakeTokensProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
      <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
        <span className="mr-2">🚀</span> Stake Tokens
      </h3>
      
      <form onSubmit={onStake} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-blue-700">Amount to Stake</label>
            <span className="text-sm text-blue-600">
              Available: {balances.diaTokenBalance} DIA
            </span>
          </div>
          <div className="flex items-center space-x-4 p-4 border-2 border-blue-200 rounded-lg bg-white focus-within:border-blue-500 transition-colors">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.0"
              value={stakeAmount || ''}
              onChange={(e) => onStakeAmountChange(Number(e.target.value))}
              className="flex-1 text-xl font-medium border-none outline-none bg-transparent"
            />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">DIA</span>
              </div>
              <span className="font-medium text-gray-700">DIA</span>
            </div>
          </div>
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={() => onStakeAmountChange(parseFloat(balances.diaTokenBalance) * 0.25)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => onStakeAmountChange(parseFloat(balances.diaTokenBalance) * 0.5)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onStakeAmountChange(parseFloat(balances.diaTokenBalance) * 0.75)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => onStakeAmountChange(parseFloat(balances.diaTokenBalance))}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stakeAmount || stakeAmount <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? '⏳ Staking...' : '🚀 STAKE TOKENS'}
        </button>
      </form>
    </div>
  );
}