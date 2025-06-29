import { expect } from "chai";
import hre from "hardhat";

// Setup chai matchers for Hardhat
import "@nomicfoundation/hardhat-chai-matchers";

const { ethers } = hre;

describe("TokenFarm", function () {
  let diaToken: any;
  let dappToken: any;
  let tokenFarm: any;
  let owner: any;
  let investor: any;

  beforeEach(async function () {
    // @ts-ignore
    [owner, investor] = await ethers.getSigners();

    // Deploy tokens
    const DiaTokenFactory = await ethers.getContractFactory("DiaToken");
    diaToken = await DiaTokenFactory.deploy();

    const DappTokenFactory = await ethers.getContractFactory("DappToken");
    dappToken = await DappTokenFactory.deploy();

    // Deploy TokenFarm
    const TokenFarmFactory = await ethers.getContractFactory("TokenFarm");
    tokenFarm = await TokenFarmFactory.deploy(await diaToken.getAddress(), await dappToken.getAddress());

    // Transfer all DappToken to TokenFarm for rewards
    const totalSupply = await dappToken.totalSupply();
    await dappToken.transfer(await tokenFarm.getAddress(), totalSupply);

    // Transfer 100 DIA tokens to investor
    await diaToken.transfer(investor.address, ethers.parseEther("100"));
  });

  describe("DiaToken deployment", function () {
    it("should have correct name", async function () {
      expect(await diaToken.name()).to.equal("Mock DAI Token");
    });
  });

  describe("DappToken deployment", function () {
    it("should have correct name", async function () {
      expect(await dappToken.name()).to.equal("DApp Token");
    });
  });

  describe("TokenFarm deployment", function () {
    it("should have correct name", async function () {
      expect(await tokenFarm.name()).to.equal("Token Farm");
    });

    it("should have DappToken balance for rewards", async function () {
      const balance = await dappToken.balanceOf(await tokenFarm.getAddress());
      expect(balance).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Staking functionality", function () {
    it("should allow investor to stake tokens", async function () {
      // Check initial balances
      const initialDiaBalance = await diaToken.balanceOf(investor.address);
      expect(initialDiaBalance).to.equal(ethers.parseEther("100"));

      // Approve and stake tokens
      await diaToken.connect(investor).approve(await tokenFarm.getAddress(), ethers.parseEther("100"));
      await tokenFarm.connect(investor).stakeTokens(ethers.parseEther("100"));

      // Check balances after staking
      const investorDiaBalance = await diaToken.balanceOf(investor.address);
      expect(investorDiaBalance).to.equal(ethers.parseEther("0"));

      const farmDiaBalance = await diaToken.balanceOf(await tokenFarm.getAddress());
      expect(farmDiaBalance).to.equal(ethers.parseEther("100"));

      const stakingBalance = await tokenFarm.stakingBalance(investor.address);
      expect(stakingBalance).to.equal(ethers.parseEther("100"));

      const isStaking = await tokenFarm.isStaking(investor.address);
      expect(isStaking).to.be.true;
    });

    it("should allow owner to issue rewards", async function () {
      // Stake tokens first
      await diaToken.connect(investor).approve(await tokenFarm.getAddress(), ethers.parseEther("100"));
      await tokenFarm.connect(investor).stakeTokens(ethers.parseEther("100"));

      // Check initial DappToken balance
      let dappBalance = await dappToken.balanceOf(investor.address);
      expect(dappBalance).to.equal(0n);

      // Issue tokens (only owner can do this)
      await tokenFarm.connect(owner).issueToken();

      // Check DappToken balance after issuing
      dappBalance = await dappToken.balanceOf(investor.address);
      expect(dappBalance).to.equal(ethers.parseEther("100"));
    });

    it("should not allow non-owner to issue rewards", async function () {
      // Stake tokens first
      await diaToken.connect(investor).approve(await tokenFarm.getAddress(), ethers.parseEther("100"));
      await tokenFarm.connect(investor).stakeTokens(ethers.parseEther("100"));

      // Try to issue tokens as investor (should fail)
      try {
        await tokenFarm.connect(investor).issueToken();
        expect.fail("Expected transaction to revert");
      } catch (error: any) {
        expect(error.message).to.include("must be owner");
      }
    });

    it("should allow investor to unstake tokens", async function () {
      // Stake tokens first
      await diaToken.connect(investor).approve(await tokenFarm.getAddress(), ethers.parseEther("100"));
      await tokenFarm.connect(investor).stakeTokens(ethers.parseEther("100"));

      // Issue rewards
      await tokenFarm.connect(owner).issueToken();

      // Unstake tokens
      await tokenFarm.connect(investor).unStakeTokens();

      // Check balances after unstaking
      const investorDiaBalance = await diaToken.balanceOf(investor.address);
      expect(investorDiaBalance).to.equal(ethers.parseEther("100"));

      const stakingBalance = await tokenFarm.stakingBalance(investor.address);
      expect(stakingBalance).to.equal(ethers.parseEther("0"));

      const isStaking = await tokenFarm.isStaking(investor.address);
      expect(isStaking).to.be.false;

      // Should still have DappToken rewards
      const dappBalance = await dappToken.balanceOf(investor.address);
      expect(dappBalance).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Faucet functionality", function () {
    it("should allow anyone to claim 10 DIA tokens from faucet", async function () {
      // Check initial balance
      const initialBalance = await diaToken.balanceOf(investor.address);
      expect(initialBalance).to.equal(ethers.parseEther("100"));

      // Use faucet
      await diaToken.connect(investor).faucet();

      // Check balance after faucet
      const newBalance = await diaToken.balanceOf(investor.address);
      expect(newBalance).to.equal(ethers.parseEther("110")); // 100 + 10
    });

    it("should increase total supply when using faucet", async function () {
      const initialSupply = await diaToken.totalSupply();

      await diaToken.connect(investor).faucet();

      const newSupply = await diaToken.totalSupply();
      expect(newSupply).to.equal(initialSupply + ethers.parseEther("10"));
    });
  });

  describe("Balance query functions", function () {
    beforeEach(async function () {
      // Set up some staking for testing
      await diaToken.connect(investor).approve(await tokenFarm.getAddress(), ethers.parseEther("50"));
      await tokenFarm.connect(investor).stakeTokens(ethers.parseEther("50"));
      await tokenFarm.connect(owner).issueToken(); // Give some DAPP rewards
    });

    it("should return correct staking info", async function () {
      const [stakedAmount, stakingStatus] = await tokenFarm.getUserStakingInfo(investor.address);

      expect(stakedAmount).to.equal(ethers.parseEther("50"));
      expect(stakingStatus).to.be.true;
    });

    it("should return correct DIA balance", async function () {
      const diaBalance = await tokenFarm.getUserDiaBalance(investor.address);
      expect(diaBalance).to.equal(ethers.parseEther("50")); // 100 - 50 staked
    });

    it("should return correct DAPP balance", async function () {
      const dappBalance = await tokenFarm.getUserDappBalance(investor.address);
      expect(dappBalance).to.equal(ethers.parseEther("50")); // Rewards from staking
    });

    it("should return zero for non-staking user", async function () {
      const [stakedAmount, stakingStatus] = await tokenFarm.getUserStakingInfo(owner.address);

      expect(stakedAmount).to.equal(ethers.parseEther("0"));
      expect(stakingStatus).to.be.false;
    });
  });
});
