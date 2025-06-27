import { UnstakeTokensProps } from '@/types';

export default function UnstakeTokens({ 
  balances, 
  unstakeAmount, 
  loading, 
  onUnstakeAmountChange, 
  onUnstake,
  onUnstakeAll 
}: UnstakeTokensProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
      <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
        <span className="mr-2">📤</span> Remove Stake
      </h3>
      
      <form onSubmit={onUnstake} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-orange-700">Amount to Remove</label>
            <span className="text-sm text-orange-600">
              Staked: {balances.tokenFarmBalance} DIA
            </span>
          </div>
          <div className="flex items-center space-x-4 p-4 border-2 border-orange-200 rounded-lg bg-white focus-within:border-orange-500 transition-colors">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.0"
              value={unstakeAmount || ''}
              onChange={(e) => onUnstakeAmountChange(Number(e.target.value))}
              className="flex-1 text-xl font-medium border-none outline-none bg-transparent"
            />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">DIA</span>
              </div>
              <span className="font-medium text-gray-700">DIA</span>
            </div>
          </div>
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={() => onUnstakeAmountChange(parseFloat(balances.tokenFarmBalance) * 0.25)}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => onUnstakeAmountChange(parseFloat(balances.tokenFarmBalance) * 0.5)}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onUnstakeAmountChange(parseFloat(balances.tokenFarmBalance) * 0.75)}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => onUnstakeAmountChange(parseFloat(balances.tokenFarmBalance))}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || !unstakeAmount || unstakeAmount <= 0 || parseFloat(balances.tokenFarmBalance) <= 0}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? '⏳ Removing...' : '📤 REMOVE STAKE'}
          </button>
          
          <button
            type="button"
            onClick={onUnstakeAll}
            disabled={loading || parseFloat(balances.tokenFarmBalance) <= 0}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-sm"
          >
            {loading ? '⏳ Removing All...' : '🚨 EMERGENCY EXIT + CLAIM'}
          </button>
        </div>
      </form>
    </div>
  );
}