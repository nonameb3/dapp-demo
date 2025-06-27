import { HeaderProps } from '@/types';

export default function Header({ account, connectWallet }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🚀</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">DeFi Token Farm</span>
              <div className="text-xs text-gray-500">Stake • Earn • Prosper</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}