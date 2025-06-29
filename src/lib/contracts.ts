import { ethers } from 'ethers';

// Contract addresses on Base Sepolia testnet (V5 with proportional rewards)
export const CONTRACT_ADDRESSES = {
  DIA_TOKEN: '0xFe55622104A05e4e0475d2B456A9f6845Ab74d12',   // TokenFarmProportionalModule#DiaToken
  DAPP_TOKEN: '0x008Fe3b45778e92804d081d9779d460B2a223DB1',  // TokenFarmProportionalModule#DappToken
  TOKEN_FARM: '0x26cc25E3aE87BE2C49d1EF554dBbA7b8369c6591'   // TokenFarmProportionalModule#TokenFarm
};

// Contract type definitions
export interface DiaTokenContract extends ethers.BaseContract {
  balanceOf(address: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
  allowance(owner: string, spender: string): Promise<bigint>;
  faucet(): Promise<ethers.ContractTransactionResponse>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
}

export interface DappTokenContract extends ethers.BaseContract {
  balanceOf(address: string): Promise<bigint>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
}

export interface TokenFarmContract extends ethers.BaseContract {
  stakeTokens(amount: bigint): Promise<ethers.ContractTransactionResponse>;
  unStakeTokens(amount: bigint): Promise<ethers.ContractTransactionResponse>;
  unStakeAllTokens(): Promise<ethers.ContractTransactionResponse>;
  claimRewards(): Promise<ethers.ContractTransactionResponse>;
  getUserStakingInfo(user: string): Promise<[bigint, boolean]>;
  getUserStakingData(user: string): Promise<[bigint, boolean, bigint, bigint, bigint]>;
  getPendingRewards(user: string): Promise<bigint>;
  getPoolStats(): Promise<[bigint, bigint, bigint, bigint, bigint]>;
  getUserProjectedRewards(user: string): Promise<[bigint, bigint, bigint, bigint]>;
  getUserDiaBalance(user: string): Promise<bigint>;
  getUserDappBalance(user: string): Promise<bigint>;
  stakingBalance(address: string): Promise<bigint>;
  isStaking(address: string): Promise<boolean>;
  totalStakedAmount(): Promise<bigint>;
  dailyRewardPool(): Promise<bigint>;
}

// Contract ABIs (simplified for the functions we need)
export const DIA_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function faucet() returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export const DAPP_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export const TOKEN_FARM_ABI = [
  'function stakeTokens(uint256 amount)',
  'function unStakeTokens(uint256 amount)',
  'function unStakeAllTokens()',
  'function claimRewards()',
  'function getUserStakingInfo(address user) view returns (uint256 stakedAmount, bool stakingStatus)',
  'function getUserStakingData(address user) view returns (uint256 stakedAmount, bool stakingStatus, uint256 pendingRewards, uint256 stakingStartTime, uint256 userDailyReward)',
  'function getPendingRewards(address user) view returns (uint256)',
  'function getPoolStats() view returns (uint256 totalStaked, uint256 dailyRewards, uint256 annualRewards, uint256 yourDailyReward, uint256 yourAnnualReward)',
  'function getUserProjectedRewards(address user) view returns (uint256 dailyReward, uint256 monthlyReward, uint256 annualReward, uint256 sharePercentage)',
  'function getUserDiaBalance(address user) view returns (uint256)',
  'function getUserDappBalance(address user) view returns (uint256)',
  'function stakingBalance(address) view returns (uint256)',
  'function isStaking(address) view returns (bool)',
  'function totalStakedAmount() view returns (uint256)',
  'function dailyRewardPool() view returns (uint256)'
];

// Contract instances
export const getContracts = (provider: ethers.BrowserProvider) => {
  const diaToken = new ethers.Contract(CONTRACT_ADDRESSES.DIA_TOKEN, DIA_TOKEN_ABI, provider) as unknown as DiaTokenContract;
  const dappToken = new ethers.Contract(CONTRACT_ADDRESSES.DAPP_TOKEN, DAPP_TOKEN_ABI, provider) as unknown as DappTokenContract;
  const tokenFarm = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_FARM, TOKEN_FARM_ABI, provider) as unknown as TokenFarmContract;

  return { diaToken, dappToken, tokenFarm };
};

// Helper functions
export const formatTokenAmount = (amount: string | bigint, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return ethers.parseUnits(amount, decimals);
};