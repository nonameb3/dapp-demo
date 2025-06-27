interface WalletConnectPromptProps {
  connectWallet: () => void;
}

export default function WalletConnectPrompt({ connectWallet }: WalletConnectPromptProps) {
  return (
    <div className="text-center py-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
      <div className="text-4xl mb-4">🦊</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-6">Connect your MetaMask wallet to start staking and earning rewards</p>
      <button
        onClick={connectWallet}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition duration-200 shadow-lg"
      >
        🦊 CONNECT METAMASK
      </button>
    </div>
  );
}