import { ethers } from 'ethers';

// Contract addresses on Base Sepolia testnet (V3 with partial unstaking)
export const CONTRACT_ADDRESSES = {
  DIA_TOKEN: '0xCD4FA800D851959f07388608446eC4F0729eec91',   // TokenFarmV3Module#DiaToken
  DAPP_TOKEN: '0x9Bc27281CF25145b2fFa55A03Ba1c593D3459390',  // TokenFarmV3Module#DappToken
  TOKEN_FARM: '0x1DfFdC9b5a8F0c12a573D602dA0dCC8ab94c2917'   // TokenFarmV3Module#TokenFarm
};

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
  'function getUserStakingInfo(address user) view returns (uint256 stakedAmount, bool stakingStatus)',
  'function getUserDiaBalance(address user) view returns (uint256)',
  'function getUserDappBalance(address user) view returns (uint256)',
  'function stakingBalance(address) view returns (uint256)',
  'function isStaking(address) view returns (bool)'
];

// Contract instances
export const getContracts = (provider: ethers.BrowserProvider) => {
  const diaToken = new ethers.Contract(CONTRACT_ADDRESSES.DIA_TOKEN, DIA_TOKEN_ABI, provider);
  const dappToken = new ethers.Contract(CONTRACT_ADDRESSES.DAPP_TOKEN, DAPP_TOKEN_ABI, provider);
  const tokenFarm = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_FARM, TOKEN_FARM_ABI, provider);

  return { diaToken, dappToken, tokenFarm };
};

// Helper functions
export const formatTokenAmount = (amount: string | bigint, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return ethers.parseUnits(amount, decimals);
};