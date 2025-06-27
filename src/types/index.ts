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
  loading: boolean;
  onClaimRewards: () => void;
}

export interface StakeTokensProps {
  balances: Balances;
  stakeAmount: number;
  loading: boolean;
  onStakeAmountChange: (amount: number) => void;
  onStake: (e: React.FormEvent) => void;
}

export interface UnstakeTokensProps {
  balances: Balances;
  unstakeAmount: number;
  loading: boolean;
  onUnstakeAmountChange: (amount: number) => void;
  onUnstake: (e: React.FormEvent) => void;
  onUnstakeAll: () => void;
}

export interface FaucetProps {
  account: string;
  loading: boolean;
  onClaimFaucet: () => void;
  connectWallet: () => void;
}