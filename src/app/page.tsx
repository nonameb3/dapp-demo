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
import { blockchainService } from '@/lib/blockchain';

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
  '0x7a69': {
    name: 'Local Hardhat',
    chainId: '0x7a69',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: [],
  },
} as const;

const DEFAULT_CHAIN = SUPPORTED_CHAINS['0x14a34'];

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [loadingStates, setLoadingStates] = useState({
    connecting: false,
    faucet: false,
    approve: false,
    stake: false,
    unstake: false,
    claimRewards: false,
  });
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'stake' | 'faucet'>('stake');
  const [needsApproval, setNeedsApproval] = useState<boolean>(true);
  const [currentChainId, setCurrentChainId] = useState<string>('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    actionButton?: { text: string; onClick: () => void };
  } | null>(null);
  
  const [balances, setBalances] = useState<Balances>({
    diaTokenBalance: '0.0',
    dappTokenBalance: '0.0',
    tokenFarmBalance: '0.0',
  });
  
  const [stakingData, setStakingData] = useState<StakingData>({
    apr: 15.5,
    totalStaked: '125000.0',
    dailyReward: '0.0',
    pendingRewards: '0.0',
  });

  // Helper function to update loading states
  const setLoading = (action: keyof typeof loadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [action]: isLoading }));
  };

  // Check if any loading is active
  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  // Check approval when stake amount changes
  useEffect(() => {
    const checkApproval = async () => {
      if (account && stakeAmount > 0) {
        try {
          const hasAllowance = await blockchainService.checkAllowance(account, stakeAmount.toString());
          setNeedsApproval(!hasAllowance);
        } catch (error) {
          console.error('Error checking allowance:', error);
          setNeedsApproval(true);
        }
      } else {
        setNeedsApproval(true);
      }
    };

    checkApproval();
  }, [account, stakeAmount]);

  // Load balances from blockchain
  const loadBalances = async (userAddress: string) => {
    if (!userAddress) return;
    
    try {
      const newBalances = await blockchainService.getBalances(userAddress);
      setBalances(newBalances);
      
      const newStakingData = await blockchainService.getStakingData(userAddress);
      setStakingData(newStakingData);
      
      // Check if approval is needed for current stake amount
      if (stakeAmount > 0) {
        const hasAllowance = await blockchainService.checkAllowance(userAddress, stakeAmount.toString());
        setNeedsApproval(!hasAllowance);
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

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
      const handleChainChanged = async (chainId: string) => {
        setCurrentChainId(chainId);
        
        // Reinitialize blockchain service when network changes
        try {
          await blockchainService.reinitialize();
          
          // Reload balances if user is connected
          if (account) {
            await loadBalances(account);
          }
        } catch (error) {
          console.error('Error reinitializing after network change:', error);
        }

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
    } catch (switchError: unknown) {
      if ((switchError as any).code === 4902) {
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
    try {
      setLoading('connecting', true);
      
      // Always reinitialize to ensure we have the latest network
      await blockchainService.reinitialize();
      
      const account = await blockchainService.connectWallet();
      setAccount(account);
      
      // Load balances after connecting
      await loadBalances(account);
      
      const chainId = await blockchainService.checkNetwork();
      setCurrentChainId(chainId);
      
      if (chainId !== DEFAULT_CHAIN.chainId) {
        setNotification({
          message: `This demo works best on ${DEFAULT_CHAIN.name}! Switch to this network for full functionality.`,
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
    } finally {
      setLoading('connecting', false);
    }
  };

  const handleApprove = async () => {
    if (!stakeAmount || stakeAmount <= 0 || !account) return;
    
    setLoading('approve', true);
    
    try {
      await blockchainService.approveTokens(stakeAmount.toString());
      
      // Check allowance after approval
      const hasAllowance = await blockchainService.checkAllowance(account, stakeAmount.toString());
      setNeedsApproval(!hasAllowance);
      
      setNotification({
        message: `Successfully approved ${stakeAmount} DIA tokens! Proceeding to stake...`,
        type: 'success'
      });

      // If approval was successful and we have enough allowance, automatically proceed to staking
      if (hasAllowance) {
        setLoading('approve', false);
        setLoading('stake', true);
        
        try {
          await blockchainService.stakeTokens(stakeAmount.toString());
          
          // Reload balances after successful staking
          await loadBalances(account);
          setStakeAmount(0);
          setNeedsApproval(true); // Reset for next stake
          
          setNotification({
            message: `Successfully staked ${stakeAmount} DIA tokens!`,
            type: 'success'
          });
        } catch (stakeError: unknown) {
          console.error('Staking failed after approval:', stakeError);
          setNotification({
            message: `Staking failed: ${(stakeError as any)?.message || 'Unknown error'}`,
            type: 'error'
          });
        } finally {
          setLoading('stake', false);
        }
      }
    } catch (error: unknown) {
      console.error('Approval failed:', error);
      setNotification({
        message: `Approval failed: ${(error as any)?.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading('approve', false);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || stakeAmount <= 0 || !account) return;
    
    // If needs approval, do approval first
    if (needsApproval) {
      await handleApprove();
      return;
    }
    
    setLoading('stake', true);
    
    try {
      await blockchainService.stakeTokens(stakeAmount.toString());
      
      // Reload balances after successful staking
      await loadBalances(account);
      setStakeAmount(0);
      setNeedsApproval(true); // Reset for next stake
      
      setNotification({
        message: `Successfully staked ${stakeAmount} DIA tokens!`,
        type: 'success'
      });
    } catch (error: unknown) {
      console.error('Staking failed:', error);
      setNotification({
        message: `Staking failed: ${(error as any)?.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading('stake', false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unstakeAmount || unstakeAmount <= 0 || !account) return;
    
    const currentStaked = parseFloat(balances.tokenFarmBalance);
    if (unstakeAmount > currentStaked) {
      setNotification({
        message: 'Cannot unstake more than your staked amount!',
        type: 'error'
      });
      return;
    }
    
    setLoading('unstake', true);
    
    try {
      await blockchainService.unstakeTokens(unstakeAmount.toString());
      
      // Reload balances after successful unstaking
      await loadBalances(account);
      setUnstakeAmount(0);
      
      setNotification({
        message: `Successfully unstaked ${unstakeAmount} DIA tokens!`,
        type: 'success'
      });
    } catch (error: unknown) {
      console.error('Unstaking failed:', error);
      setNotification({
        message: `Unstaking failed: ${(error as any)?.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading('unstake', false);
    }
  };

  const handleUnstakeAll = async () => {
    const stakedAmount = parseFloat(balances.tokenFarmBalance);
    if (stakedAmount <= 0 || !account) return;
    
    setLoading('unstake', true);
    
    try {
      // Call unstakeTokens without amount parameter to unstake all
      await blockchainService.unstakeTokens();
      
      // Reload balances after successful unstaking
      await loadBalances(account);
      
      setNotification({
        message: 'Successfully unstaked all tokens!',
        type: 'success'
      });
    } catch (error: unknown) {
      console.error('Unstaking failed:', error);
      setNotification({
        message: `Unstaking failed: ${(error as any)?.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading('unstake', false);
    }
  };

  const handleClaimFaucet = async () => {
    if (!account) return;
    
    setLoading('faucet', true);
    
    try {
      await blockchainService.claimFaucet();
      
      // Reload balances after successful faucet claim
      await loadBalances(account);
      
      setNotification({
        message: 'Successfully claimed 10 DIA tokens from faucet!',
        type: 'success'
      });
    } catch (error: unknown) {
      console.error('Faucet claim failed:', error);
      setNotification({
        message: `Faucet claim failed: ${(error as any)?.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading('faucet', false);
    }
  };

  const handleClaimRewards = async () => {
    const rewards = parseFloat(stakingData.pendingRewards);
    if (rewards <= 0) return;
    
    setLoading('claimRewards', true);

    // For now, keep mock behavior since we haven't implemented automatic rewards yet
    setTimeout(() => {
      setBalances(prev => ({
        ...prev,
        dappTokenBalance: (parseFloat(prev.dappTokenBalance) + rewards).toFixed(6)
      }));
      
      setStakingData(prev => ({
        ...prev,
        pendingRewards: '0.0'
      }));
      
      setNotification({
        message: `Claimed ${rewards.toFixed(6)} DAPP tokens!`,
        type: 'success'
      });
      
      setLoading('claimRewards', false);
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

        {/* Debug refresh button */}
        {account && (
          <div className="mb-4">
            <button
              onClick={() => loadBalances(account)}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
            >
              🔄 Refresh Balances
            </button>
          </div>
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
                      isClaimingRewards={loadingStates.claimRewards}
                      onClaimRewards={handleClaimRewards}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <StakeTokens
                        balances={balances}
                        stakeAmount={stakeAmount}
                        isApproving={loadingStates.approve}
                        isStaking={loadingStates.stake}
                        needsApproval={needsApproval}
                        onStakeAmountChange={setStakeAmount}
                        onStake={handleStake}
                      />

                      <UnstakeTokens
                        balances={balances}
                        unstakeAmount={unstakeAmount}
                        isUnstaking={loadingStates.unstake}
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
                isClaiming={loadingStates.faucet}
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