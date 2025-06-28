'use client';

import { useState, useEffect } from 'react';
import {
  Header,
  StatsOverview,
  ClaimRewards,
  StakeTokens,
  UnstakeTokens,
  StakingOverview,
  Faucet,
  HowItWorks,
  WalletConnectPrompt,
  NotificationBanner
} from '@/components';
import { Balances, StakingData } from '@/types';

// Chain configurations
const SUPPORTED_CHAINS = {
  '0x14a34': {
    name: 'Base Sepolia Testnet',
    chainId: '0x14a34',
    rpcUrls: ['https://sepolia.base.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia-explorer.base.org'],
  },
  '0x2105': {
    name: 'Base Mainnet',
    chainId: '0x2105',
    rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://basescan.org'],
  },
} as const;

const DEFAULT_CHAIN = SUPPORTED_CHAINS['0x14a34'];

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'stake' | 'faucet'>('stake');
  const [currentChainId, setCurrentChainId] = useState<string>('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    actionButton?: { text: string; onClick: () => void };
  } | null>(null);
  
  const [balances, setBalances] = useState<Balances>({
    diaTokenBalance: '1000.0',
    dappTokenBalance: '0.0',
    tokenFarmBalance: '0.0',
  });
  
  const [stakingData, setStakingData] = useState<StakingData>({
    apr: 15.5,
    totalStaked: '125000.0',
    dailyReward: '0.0',
    pendingRewards: '0.0',
  });

  // Mock reward calculation effect
  useEffect(() => {
    if (parseFloat(balances.tokenFarmBalance) > 0) {
      const interval = setInterval(() => {
        const staked = parseFloat(balances.tokenFarmBalance);
        const dailyRate = stakingData.apr / 365 / 100;
        const newReward = staked * dailyRate;
        
        setStakingData(prev => ({
          ...prev,
          dailyReward: newReward.toFixed(6),
          pendingRewards: (parseFloat(prev.pendingRewards) + newReward / 24).toFixed(6)
        }));
      }, 60000); // Update every minute for demo
      
      return () => clearInterval(interval);
    }
  }, [balances.tokenFarmBalance, stakingData.apr]);

  // Check current chain on load
  useEffect(() => {
    const checkChain = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
          setCurrentChainId(chainId);
          
          if (chainId !== DEFAULT_CHAIN.chainId) {
            setNotification({
              message: `Welcome! This demo page uses ${DEFAULT_CHAIN.name} for testing. Please switch to this network for the best experience.`,
              type: 'info',
              actionButton: {
                text: 'Switch Network',
                onClick: () => {
                  switchToChain(DEFAULT_CHAIN);
                  setNotification(null);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error checking chain:', error);
        }
      }
    };
    
    checkChain();
    
    // Listen for chain changes
    if (window.ethereum && typeof window !== 'undefined') {
      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(chainId);
        if (chainId !== DEFAULT_CHAIN.chainId) {
          setNotification({
            message: `Network changed! This demo works best on ${DEFAULT_CHAIN.name}.`,
            type: 'warning',
            actionButton: {
              text: 'Switch to Base Sepolia',
              onClick: () => {
                switchToChain(DEFAULT_CHAIN);
                setNotification(null);
              }
            }
          });
        } else {
          setNotification(null);
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => window.ethereum?.removeListener('chainChanged', handleChainChanged);
    }
  }, []);

  const switchToChain = async (chainConfig: typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS]) => {
    if (!window.ethereum) {
      setNotification({
        message: 'This demo requires MetaMask! Please install MetaMask browser extension to continue.',
        type: 'warning'
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
          setNotification({
            message: 'Could not auto-add the network. Please add Base Sepolia manually in MetaMask for this demo!',
            type: 'error'
          });
        }
      } else {
        console.error('Error switching chain:', switchError);
        setNotification({
          message: 'Could not switch networks automatically. Please switch to Base Sepolia manually in MetaMask for this demo!',
          type: 'error'
        });
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        setCurrentChainId(chainId);
        
        if (chainId !== DEFAULT_CHAIN.chainId) {
          setNotification({
            message: `This demo page is optimized for ${DEFAULT_CHAIN.name}! Switch to this network for the full experience.`,
            type: 'warning',
            actionButton: {
              text: 'Switch Network',
              onClick: () => {
                switchToChain(DEFAULT_CHAIN);
                setNotification(null);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setNotification({
          message: 'Could not connect to your wallet. Please make sure MetaMask is installed and try again!',
          type: 'error'
        });
      }
    } else {
      setNotification({
        message: 'This demo requires MetaMask! Please install MetaMask browser extension to continue.',
        type: 'warning'
      });
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || stakeAmount <= 0) return;
    
    setLoading(true);
    
    // Mock staking logic
    setTimeout(() => {
      const currentDia = parseFloat(balances.diaTokenBalance);
      const currentStaked = parseFloat(balances.tokenFarmBalance);
      
      if (currentDia >= stakeAmount) {
        setBalances(prev => ({
          ...prev,
          diaTokenBalance: (currentDia - stakeAmount).toFixed(2),
          tokenFarmBalance: (currentStaked + stakeAmount).toFixed(2)
        }));
        
        // Update total staked
        setStakingData(prev => ({
          ...prev,
          totalStaked: (parseFloat(prev.totalStaked) + stakeAmount).toFixed(2)
        }));
        
        setStakeAmount(0);
      }
      
      setLoading(false);
    }, 2000);
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unstakeAmount || unstakeAmount <= 0) return;
    
    const currentStaked = parseFloat(balances.tokenFarmBalance);
    if (unstakeAmount > currentStaked) return;
    
    setLoading(true);
    
    // Mock removing stake logic
    setTimeout(() => {
      const currentDia = parseFloat(balances.diaTokenBalance);
      
      setBalances(prev => ({
        ...prev,
        diaTokenBalance: (currentDia + unstakeAmount).toFixed(2),
        tokenFarmBalance: (currentStaked - unstakeAmount).toFixed(2)
      }));
      
      // Update staking data
      setStakingData(prev => ({
        ...prev,
        totalStaked: (parseFloat(prev.totalStaked) - unstakeAmount).toFixed(2)
      }));
      
      setUnstakeAmount(0);
      setLoading(false);
    }, 2000);
  };

  const handleUnstakeAll = async () => {
    const stakedAmount = parseFloat(balances.tokenFarmBalance);
    if (stakedAmount <= 0) return;
    
    setLoading(true);
    
    // Mock removing all stake logic
    setTimeout(() => {
      const currentDia = parseFloat(balances.diaTokenBalance);
      const pendingRewards = parseFloat(stakingData.pendingRewards);
      
      setBalances(prev => ({
        ...prev,
        diaTokenBalance: (currentDia + stakedAmount).toFixed(2),
        dappTokenBalance: (parseFloat(prev.dappTokenBalance) + pendingRewards).toFixed(6),
        tokenFarmBalance: '0.0'
      }));
      
      // Update staking data
      setStakingData(prev => ({
        ...prev,
        totalStaked: (parseFloat(prev.totalStaked) - stakedAmount).toFixed(2),
        dailyReward: '0.0',
        pendingRewards: '0.0'
      }));
      
      setLoading(false);
    }, 2000);
  };

  const handleClaimFaucet = async () => {
    setLoading(true);
    
    // Mock faucet logic
    setTimeout(() => {
      const faucetAmount = 100;
      setBalances(prev => ({
        ...prev,
        diaTokenBalance: (parseFloat(prev.diaTokenBalance) + faucetAmount).toFixed(2)
      }));
      setLoading(false);
    }, 1500);
  };

  const handleClaimRewards = async () => {
    const rewards = parseFloat(stakingData.pendingRewards);
    if (rewards <= 0) return;
    
    setLoading(true);

    setTimeout(() => {
      setBalances(prev => ({
        ...prev,
        dappTokenBalance: (parseFloat(prev.dappTokenBalance) + rewards).toFixed(6)
      }));
      
      setStakingData(prev => ({
        ...prev,
        pendingRewards: '0.0'
      }));
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header 
        account={account} 
        connectWallet={connectWallet}
        currentChainId={currentChainId}
        onChainSelect={(chainId) => {
          const chainConfig = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
          if (chainConfig) switchToChain(chainConfig);
        }}
        supportedChains={Object.fromEntries(
          Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => [key, { name: chain.name, chainId: chain.chainId }])
        )}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification && (
          <NotificationBanner
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            actionButton={notification.actionButton}
          />
        )}
        <StatsOverview balances={balances} stakingData={stakingData} />

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('stake')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'stake'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Stake & Earn
            </button>
            <button
              onClick={() => setActiveTab('faucet')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'faucet'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚰 Faucet
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'stake' ? (
              <div className="space-y-8">
                <StakingOverview balances={balances} stakingData={stakingData} />

                {account ? (
                  <div className="space-y-8">
                    <ClaimRewards 
                      stakingData={stakingData}
                      loading={loading}
                      onClaimRewards={handleClaimRewards}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <StakeTokens
                        balances={balances}
                        stakeAmount={stakeAmount}
                        loading={loading}
                        onStakeAmountChange={setStakeAmount}
                        onStake={handleStake}
                      />

                      <UnstakeTokens
                        balances={balances}
                        unstakeAmount={unstakeAmount}
                        loading={loading}
                        onUnstakeAmountChange={setUnstakeAmount}
                        onUnstake={handleUnstake}
                        onUnstakeAll={handleUnstakeAll}
                      />
                    </div>
                  </div>
                ) : (
                  <WalletConnectPrompt connectWallet={connectWallet} />
                )}
              </div>
            ) : (
              <Faucet 
                account={account}
                loading={loading}
                onClaimFaucet={handleClaimFaucet}
                connectWallet={connectWallet}
              />
            )}
          </div>
        </div>

        <HowItWorks apr={stakingData.apr} />
      </main>
    </div>
  );
}