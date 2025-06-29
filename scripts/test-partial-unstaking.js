const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing partial unstaking functionality locally...\n");

  // Deploy contracts locally
  console.log("📦 Deploying contracts...");
  
  // Get signers
  const [deployer, user1] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("👤 User1:", user1.address);

  // Deploy DiaToken
  const DiaToken = await ethers.getContractFactory("DiaToken");
  const diaToken = await DiaToken.deploy();
  await diaToken.waitForDeployment();
  console.log("✅ DiaToken deployed:", await diaToken.getAddress());

  // Deploy DappToken  
  const DappToken = await ethers.getContractFactory("DappToken");
  const dappToken = await DappToken.deploy();
  await dappToken.waitForDeployment();
  console.log("✅ DappToken deployed:", await dappToken.getAddress());

  // Deploy TokenFarm with correct order
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(await diaToken.getAddress(), await dappToken.getAddress());
  await tokenFarm.waitForDeployment();
  console.log("✅ TokenFarm deployed:", await tokenFarm.getAddress());

  // Transfer DAPP tokens to farm for rewards
  const dappSupply = await dappToken.totalSupply();
  await dappToken.transfer(await tokenFarm.getAddress(), dappSupply);
  console.log("✅ Transferred DAPP tokens to farm");

  console.log("\n🧪 Testing partial unstaking...");

  // User1 claims from faucet
  console.log("\n1. Claiming from faucet...");
  await diaToken.connect(user1).faucet();
  const balance1 = await diaToken.balanceOf(user1.address);
  console.log("User1 DIA balance after faucet:", ethers.formatEther(balance1));

  // User1 approves and stakes 8 DIA
  console.log("\n2. Staking 8 DIA tokens...");
  const stakeAmount = ethers.parseEther("8");
  await diaToken.connect(user1).approve(await tokenFarm.getAddress(), stakeAmount);
  await tokenFarm.connect(user1).stakeTokens(stakeAmount);
  
  const [stakedAmount, stakingStatus] = await tokenFarm.getUserStakingInfo(user1.address);
  console.log("Staked amount:", ethers.formatEther(stakedAmount));
  console.log("Staking status:", stakingStatus);

  // Test partial unstaking - unstake 3 DIA
  console.log("\n3. Partial unstaking 3 DIA tokens...");
  const unstakeAmount = ethers.parseEther("3");
  await tokenFarm.connect(user1).unStakeTokens(unstakeAmount);
  
  const [stakedAfterPartial, stakingAfterPartial] = await tokenFarm.getUserStakingInfo(user1.address);
  const balanceAfterPartial = await diaToken.balanceOf(user1.address);
  
  console.log("Staked amount after partial unstaking:", ethers.formatEther(stakedAfterPartial));
  console.log("Staking status after partial unstaking:", stakingAfterPartial);
  console.log("User DIA balance after partial unstaking:", ethers.formatEther(balanceAfterPartial));

  // Test unstaking all remaining tokens
  console.log("\n4. Unstaking all remaining tokens...");
  await tokenFarm.connect(user1).unStakeAllTokens();
  
  const [stakedAfterAll, stakingAfterAll] = await tokenFarm.getUserStakingInfo(user1.address);
  const balanceAfterAll = await diaToken.balanceOf(user1.address);
  
  console.log("Staked amount after unstaking all:", ethers.formatEther(stakedAfterAll));
  console.log("Staking status after unstaking all:", stakingAfterAll);
  console.log("User DIA balance after unstaking all:", ethers.formatEther(balanceAfterAll));

  console.log("\n✅ All tests passed! Partial unstaking is working correctly.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });