import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre as any;

// Setup chai matchers for Hardhat
import "@nomicfoundation/hardhat-chai-matchers";

describe("TokenFarm", function () {
  let diaToken: any;
  let dappToken: any;
  let tokenFarm: any;
  let owner: any;
  let investor: any;

  beforeEach(async function () {
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
});