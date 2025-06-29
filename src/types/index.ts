export interface Balances {
  diaTokenBalance: string;
  dappTokenBalance: string;
  tokenFarmBalance: string;
}

export interface StakingData {
  apr: number;
  totalStaked: string;
  dailyReward: string;
  pendingRewards: string;
}

export interface ComponentProps {
  account: string;
  loading: boolean;
  balances: Balances;
  stakingData: StakingData;
}

export interface HeaderProps {
  account: string;
  connectWallet: () => void;
}

export interface StatsOverviewProps {
  balances: Balances;
  stakingData: StakingData;
}

export interface ClaimRewardsProps {
  stakingData: StakingData;
  isClaimingRewards: boolean;
  onClaimRewards: () => void;
}

export interface StakeTokensProps {
  balances: Balances;
  stakeAmount: number;
  isApproving: boolean;
  isStaking: boolean;
  needsApproval: boolean;
  onStakeAmountChange: (amount: number) => void;
  onStake: (e: React.FormEvent) => void;
}

export interface UnstakeTokensProps {
  balances: Balances;
  unstakeAmount: number;
  isUnstaking: boolean;
  onUnstakeAmountChange: (amount: number) => void;
  onUnstake: (e: React.FormEvent) => void;
  onUnstakeAll: () => void;
}

export interface FaucetProps {
  account: string;
  isClaiming: boolean;
  onClaimFaucet: () => void;
  connectWallet: () => void;
}