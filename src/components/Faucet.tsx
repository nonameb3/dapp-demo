import { FaucetProps } from '@/types';

export default function Faucet({ account, loading, onClaimFaucet, connectWallet }: FaucetProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🚰 DIA Token Faucet</h3>
        <p className="text-gray-600 mb-6">Get free DIA tokens for testing the staking platform</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <div className="text-center space-y-4">
          <div className="text-4xl">🎁</div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Free Tokens Available</div>
            <div className="text-3xl font-bold text-orange-600">100 DIA</div>
            <div className="text-sm text-gray-600 mt-1">
              Claim once every 24 hours for testing
            </div>
          </div>
          
          {account ? (
            <button
              onClick={onClaimFaucet}
              disabled={loading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Claiming...' : '🎁 CLAIM FREE TOKENS'}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Connect your wallet to claim free tokens</p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition duration-200"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Faucet Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each claim gives you 100 DIA tokens</li>
          <li>• You can claim once every 24 hours</li>
          <li>• These are test tokens for demonstration purposes</li>
          <li>• Use them to test the staking functionality</li>
        </ul>
      </div>
    </div>
  );
}