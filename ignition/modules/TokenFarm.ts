import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenFarmModule = buildModule("TokenFarmModule", (m) => {
  // Deploy DiaToken
  const diaToken = m.contract("DiaToken");

  // Deploy DappToken
  const dappToken = m.contract("DappToken");

  // Deploy TokenFarm with both tokens as constructor parameters
  const tokenFarm = m.contract("TokenFarm", [dappToken, diaToken]);

  // Transfer all DappToken supply to TokenFarm for rewards
  m.call(dappToken, "transfer", [tokenFarm, m.staticCall(dappToken, "totalSupply")]);

  return { diaToken, dappToken, tokenFarm };
});

export default TokenFarmModule;