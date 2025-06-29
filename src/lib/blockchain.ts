import { ethers } from 'ethers';
import { getContracts, formatTokenAmount, parseTokenAmount } from './contracts';
import { Balances, StakingData } from '@/types';

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: ReturnType<typeof getContracts> | null = null;

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contracts = getContracts(this.provider);
  }

  // Reinitialize when network changes
  async reinitialize() {
    this.provider = null;
    this.signer = null;
    this.contracts = null;
    await this.initialize();
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) await this.initialize();
    
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    return accounts[0];
  }

  async getBalances(userAddress: string): Promise<Balances> {
    if (!this.contracts) throw new Error('Contracts not initialized');

    try {
      // Get balances directly from token contracts and staking info from farm
      const [diaBalance, dappBalance, [stakedAmount]] = await Promise.all([
        this.contracts.diaToken.balanceOf(userAddress),
        this.contracts.dappToken.balanceOf(userAddress), 
        this.contracts.tokenFarm.getUserStakingInfo(userAddress)
      ]);

      console.log('Raw balances:', { diaBalance, dappBalance, stakedAmount });

      return {
        diaTokenBalance: formatTokenAmount(diaBalance),
        dappTokenBalance: formatTokenAmount(dappBalance),
        tokenFarmBalance: formatTokenAmount(stakedAmount)
      };
    } catch (error) {
      console.error('Error getting balances:', error);
      // Return default values if contract calls fail
      return {
        diaTokenBalance: '0.0',
        dappTokenBalance: '0.0',
        tokenFarmBalance: '0.0'
      };
    }
  }

  async getStakingData(userAddress?: string): Promise<StakingData> {
    // For now, return mock data as we haven't implemented reward calculation yet
    let pendingRewards = '0.0';
    let dailyReward = '0.0';
    
    // Only show rewards if user is actually staking
    if (userAddress && this.contracts) {
      try {
        const [stakedAmount, isStaking] = await this.contracts.tokenFarm.getUserStakingInfo(userAddress);
        if (isStaking && stakedAmount > 0) {
          // Mock rewards based on staked amount - for demo only
          const staked = parseFloat(formatTokenAmount(stakedAmount));
          dailyReward = (staked * 0.155 / 365).toFixed(6); // 15.5% APY
          pendingRewards = (staked * 0.001).toFixed(6); // Small mock pending amount
        }
      } catch (error) {
        console.error('Error getting staking info:', error);
      }
    }
    
    return {
      apr: 15.5,
      totalStaked: '125000.0',
      dailyReward,
      pendingRewards
    };
  }

  async claimFaucet(): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }
    
    if (!this.contracts || !this.signer) throw new Error('Not connected');

    try {
      const diaTokenWithSigner = this.contracts.diaToken.connect(this.signer);
      const tx = await diaTokenWithSigner.faucet();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Faucet claim failed:', error);
      throw error;
    }
  }

  async checkAllowance(userAddress: string, amount: string): Promise<boolean> {
    if (!this.contracts) throw new Error('Contracts not initialized');
    
    const amountWei = parseTokenAmount(amount);
    const tokenFarmAddress = this.contracts.tokenFarm.target || await this.contracts.tokenFarm.getAddress();
    const allowance = await this.contracts.diaToken.allowance(userAddress, tokenFarmAddress);
    
    return allowance >= amountWei;
  }

  async approveTokens(amount: string): Promise<boolean> {
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }
    
    if (!this.contracts || !this.signer) throw new Error('Not connected');

    try {
      const amountWei = parseTokenAmount(amount);
      const diaTokenWithSigner = this.contracts.diaToken.connect(this.signer);
      const tokenFarmAddress = this.contracts.tokenFarm.target || await this.contracts.tokenFarm.getAddress();
      
      console.log('Approving tokens...');
      const approveTx = await diaTokenWithSigner.approve(tokenFarmAddress, amountWei);
      await approveTx.wait();
      console.log('Approval confirmed');
      
      return true;
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
  }

  async stakeTokens(amount: string): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }
    
    if (!this.contracts || !this.signer) throw new Error('Not connected');

    try {
      const userAddress = await this.signer.getAddress();
      const amountWei = parseTokenAmount(amount);
      
      console.log('Staking details:', {
        user: userAddress,
        amount: amount,
        amountWei: amountWei.toString(),
        tokenFarmAddress: this.contracts.tokenFarm.target || await this.contracts.tokenFarm.getAddress()
      });

      // Check current balance
      const diaBalance = await this.contracts.diaToken.balanceOf(userAddress);
      console.log('Current DIA balance:', formatTokenAmount(diaBalance));
      
      if (diaBalance < amountWei) {
        throw new Error(`Insufficient DIA balance. Have: ${formatTokenAmount(diaBalance)}, Need: ${amount}`);
      }

      // Check allowance
      const hasAllowance = await this.checkAllowance(userAddress, amount);
      if (!hasAllowance) {
        throw new Error('Insufficient allowance. Please approve tokens first.');
      }

      // Stake the tokens
      console.log('Staking tokens...');
      const tokenFarmWithSigner = this.contracts.tokenFarm.connect(this.signer);
      const stakeTx = await tokenFarmWithSigner.stakeTokens(amountWei);
      await stakeTx.wait();
      console.log('Staking confirmed');
      
      return true;
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }

  async unstakeTokens(amount?: string): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }
    
    if (!this.contracts || !this.signer) throw new Error('Not connected');

    try {
      const tokenFarmWithSigner = this.contracts.tokenFarm.connect(this.signer);
      
      if (amount) {
        // Partial unstaking
        const amountWei = parseTokenAmount(amount);
        const tx = await tokenFarmWithSigner.unStakeTokens(amountWei);
        await tx.wait();
      } else {
        // Unstake all tokens
        const tx = await tokenFarmWithSigner.unStakeAllTokens();
        await tx.wait();
      }
      
      return true;
    } catch (error) {
      console.error('Unstaking failed:', error);
      throw error;
    }
  }

  async checkNetwork(): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const network = await this.provider.getNetwork();
    return `0x${network.chainId.toString(16)}`;
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();