import { ethers } from "ethers";
import { getContracts, formatTokenAmount, parseTokenAmount, DiaTokenContract, DappTokenContract, TokenFarmContract } from "./contracts";
import { Balances, StakingData } from "@/types";

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: { 
    diaToken: DiaTokenContract; 
    dappToken: DappTokenContract; 
    tokenFarm: TokenFarmContract; 
  } | null = null;

  async initialize() {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
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
      throw new Error("MetaMask not found");
    }

    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    return accounts[0];
  }

  async getBalances(userAddress: string): Promise<Balances> {
    if (!this.contracts) throw new Error("Contracts not initialized");

    try {
      // Get balances directly from token contracts and staking info from farm
      const [diaBalance, dappBalance, [stakedAmount]] = await Promise.all([
        this.contracts.diaToken.balanceOf(userAddress),
        this.contracts.dappToken.balanceOf(userAddress),
        this.contracts.tokenFarm.getUserStakingInfo(userAddress),
      ]);

      console.log("Raw balances:", { diaBalance, dappBalance, stakedAmount });

      return {
        diaTokenBalance: formatTokenAmount(diaBalance),
        dappTokenBalance: formatTokenAmount(dappBalance),
        tokenFarmBalance: formatTokenAmount(stakedAmount),
      };
    } catch (error) {
      console.error("Error getting balances:", error);
      // Return default values if contract calls fail
      return {
        diaTokenBalance: "0.0",
        dappTokenBalance: "0.0",
        tokenFarmBalance: "0.0",
      };
    }
  }

  async getStakingData(userAddress?: string): Promise<StakingData> {
    if (!this.contracts) {
      throw new Error("Contracts not initialized");
    }

    try {
      // Get pool statistics
      const [totalStakedWei] = await this.contracts.tokenFarm.getPoolStats();

      // Convert total staked to human readable
      const totalStaked = formatTokenAmount(totalStakedWei);

      let pendingRewards = "0.0";
      let dailyReward = "0.0";
      let monthlyReward = "0.0";
      let annualReward = "0.0";
      let sharePercentage = "0.0";

      // Get user-specific data if address provided
      if (userAddress) {
        const [stakedAmount, isStaking, pendingRewardsWei] = await this.contracts.tokenFarm.getUserStakingData(
          userAddress
        );

        // Debug logging removed for cleaner console

        if (isStaking && stakedAmount > 0) {
          // Convert pending rewards from wei to human readable
          pendingRewards = formatTokenAmount(pendingRewardsWei);

          // Get projected rewards for user
          const [dailyWei, monthlyWei, annualWei, sharePoints] = await this.contracts.tokenFarm.getUserProjectedRewards(userAddress);

          dailyReward = formatTokenAmount(dailyWei);
          monthlyReward = formatTokenAmount(monthlyWei);
          annualReward = formatTokenAmount(annualWei);

          // Workaround: If sharePoints is 0 due to precision loss, calculate manually
          if (Number(sharePoints) === 0 && stakedAmount > 0) {
            // Calculate percentage manually: (userStaked / totalStaked) * 100
            const userStakedEther = parseFloat(formatTokenAmount(stakedAmount));
            const totalStakedEther = parseFloat(totalStaked);
            const manualPercentage = (userStakedEther / totalStakedEther) * 100;
            sharePercentage = manualPercentage.toFixed(6);

            // Using frontend calculation due to smart contract precision limitations
          } else {
            // Using smart contract provided share points

            sharePercentage = (Number(sharePoints) / 10000).toFixed(6); // Convert basis points to percentage with 6 decimals
          }
        }
      }

      // Calculate APR if user has staked tokens
      let apr = 0;
      if (userAddress) {
        const [stakedAmount] = await this.contracts.tokenFarm.getUserStakingInfo(userAddress);
        if (stakedAmount > 0) {
          const staked = parseFloat(formatTokenAmount(stakedAmount));
          const annual = parseFloat(annualReward);
          apr = (annual / staked) * 100; // APR = (annual_rewards / staked_amount) × 100
        }
      }

      return {
        dailyReward,
        monthlyReward,
        annualReward,
        sharePercentage,
        totalStaked,
        pendingRewards,
        apr,
      };
    } catch (error) {
      console.error("Error getting staking data:", error);
      throw new Error("Failed to fetch staking data from contract");
    }
  }

  async claimFaucet(): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }

    if (!this.contracts || !this.signer) throw new Error("Not connected");

    try {
      const diaTokenWithSigner = this.contracts.diaToken.connect(this.signer);
      const tx = await diaTokenWithSigner.faucet();
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Faucet claim failed:", error);
      throw error;
    }
  }

  async checkAllowance(userAddress: string, amount: string): Promise<boolean> {
    if (!this.contracts) throw new Error("Contracts not initialized");

    const amountWei = parseTokenAmount(amount);
    const tokenFarmAddress = this.contracts.tokenFarm.target || (await this.contracts.tokenFarm.getAddress());
    const allowance = await this.contracts.diaToken.allowance(userAddress, tokenFarmAddress as string);

    return allowance >= amountWei;
  }

  async approveTokens(amount: string): Promise<boolean> {
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }

    if (!this.contracts || !this.signer) throw new Error("Not connected");

    try {
      const amountWei = parseTokenAmount(amount);
      const diaTokenWithSigner = this.contracts.diaToken.connect(this.signer);
      const tokenFarmAddress = this.contracts.tokenFarm.target || (await this.contracts.tokenFarm.getAddress());

      console.log("Approving tokens...");
      const approveTx = await diaTokenWithSigner.approve(tokenFarmAddress, amountWei);
      await approveTx.wait();
      console.log("Approval confirmed");

      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  }

  async stakeTokens(amount: string): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }

    if (!this.contracts || !this.signer) throw new Error("Not connected");

    try {
      const userAddress = await this.signer.getAddress();
      const amountWei = parseTokenAmount(amount);

      console.log("Staking details:", {
        user: userAddress,
        amount: amount,
        amountWei: amountWei.toString(),
        tokenFarmAddress: this.contracts.tokenFarm.target || (await this.contracts.tokenFarm.getAddress()),
      });

      // Check current balance
      const diaBalance = await this.contracts.diaToken.balanceOf(userAddress);
      console.log("Current DIA balance:", formatTokenAmount(diaBalance));

      if (diaBalance < amountWei) {
        throw new Error(`Insufficient DIA balance. Have: ${formatTokenAmount(diaBalance)}, Need: ${amount}`);
      }

      // Check allowance
      const hasAllowance = await this.checkAllowance(userAddress, amount);
      if (!hasAllowance) {
        throw new Error("Insufficient allowance. Please approve tokens first.");
      }

      // Stake the tokens
      console.log("Staking tokens...");
      const tokenFarmWithSigner = this.contracts.tokenFarm.connect(this.signer);
      const stakeTx = await tokenFarmWithSigner.stakeTokens(amountWei);
      await stakeTx.wait();
      console.log("Staking confirmed");

      return true;
    } catch (error) {
      console.error("Staking failed:", error);
      throw error;
    }
  }

  async unstakeTokens(amount?: string): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }

    if (!this.contracts || !this.signer) throw new Error("Not connected");

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
      console.error("Unstaking failed:", error);
      throw error;
    }
  }

  async claimRewards(): Promise<boolean> {
    // Ensure we're properly initialized
    if (!this.contracts || !this.signer) {
      await this.initialize();
    }

    if (!this.contracts || !this.signer) throw new Error("Not connected");

    try {
      const tokenFarmWithSigner = this.contracts.tokenFarm.connect(this.signer);
      const tx = await tokenFarmWithSigner.claimRewards();
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Claim rewards failed:", error);
      throw error;
    }
  }

  async checkNetwork(): Promise<string> {
    if (!this.provider) throw new Error("Provider not initialized");

    const network = await this.provider.getNetwork();
    return `0x${network.chainId.toString(16)}`;
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();
