import { ClaimRewardsProps } from "@/types";

export default function ClaimRewards({ stakingData, isClaimingRewards, onClaimRewards }: ClaimRewardsProps) {
  const pendingRewards = parseFloat(stakingData.pendingRewards || "0");

  return (
    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">💰</span>
          <h3 className="text-xl font-bold text-green-800">Claim Your Rewards</h3>
          <span className="text-2xl">💰</span>
        </div>

        <div className="flex items-center justify-center space-x-2 flex-row">
          <div className="bg-white/60 rounded-lg p-4 inline-block">
            <div className="text-sm text-green-700 font-medium">Your Pending Rewards</div>
            <div className="text-3xl font-bold text-green-600">
              {stakingData.pendingRewards || "0.000000"} <span className="text-lg text-green-500">DAPP</span>
            </div>
            {pendingRewards === 0 && <div className="text-xs text-green-500 mt-2 italic">Start staking to earn rewards every minute!</div>}
          </div>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaimRewards();
              }}
              disabled={isClaimingRewards || pendingRewards <= 0}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
            >
              {isClaimingRewards ? "⏳ Claiming..." : pendingRewards > 0 ? "🎉 CLAIM REWARDS" : "💰 NO REWARDS YET"}
            </button>
          </div>
        </div>

        {pendingRewards === 0 && (
          <div className="text-sm text-green-700 bg-green-100 rounded-lg p-3 mt-2">
            <strong>💡 Tip:</strong> Stake your DIA tokens below to start earning DAPP rewards!
          </div>
        )}
      </div>
    </div>
  );
}
