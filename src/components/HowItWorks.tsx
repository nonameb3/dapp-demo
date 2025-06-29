import { StakingData } from '@/types';

interface HowItWorksProps {
  stakingData: StakingData;
}

export default function HowItWorks({ stakingData }: HowItWorksProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 How it Works</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🦊</div>
          <div className="font-semibold text-gray-900">Connect Wallet</div>
          <div className="text-sm text-gray-600">Connect your MetaMask wallet</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🚰</div>
          <div className="font-semibold text-gray-900">Get Test Tokens</div>
          <div className="text-sm text-gray-600">Claim free DIA tokens from faucet</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🚀</div>
          <div className="font-semibold text-gray-900">Stake Tokens</div>
          <div className="text-sm text-gray-600">Stake DIA to earn DAPP rewards</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">💰</div>
          <div className="font-semibold text-gray-900">Earn Rewards</div>
          <div className="text-sm text-gray-600">
            Earn {stakingData.apr > 0 ? stakingData.apr.toFixed(1) : 'dynamic'}% APR (proportional rewards)
          </div>
        </div>
      </div>
    </div>
  );
}