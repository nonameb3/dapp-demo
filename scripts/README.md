# Scripts Directory

## Available Scripts

### `test-partial-unstaking.js`
Tests the complete staking and partial unstaking functionality locally using Hardhat network.

**Usage:**
```bash
npx hardhat run scripts/test-partial-unstaking.js --network hardhat
```

**What it tests:**
- Faucet functionality
- Token staking
- Partial unstaking (unstaking specific amounts)
- Full unstaking
- Balance and status tracking

### `test-v3-contracts.js`
Tests the deployed V3 contracts on Base Sepolia testnet with real transactions.

**Usage:**
```bash
npx hardhat run scripts/test-v3-contracts.js --network baseSepolia
```

**What it tests:**
- V3 contract connectivity
- Faucet on deployed contracts
- Staking on Base Sepolia
- Partial unstaking on Base Sepolia
- Full unstaking on Base Sepolia

**Contract Addresses (V3):**
- DIA Token: `0xCD4FA800D851959f07388608446eC4F0729eec91`
- DAPP Token: `0x9Bc27281CF25145b2fFa55A03Ba1c593D3459390`
- TokenFarm: `0x1DfFdC9b5a8F0c12a573D602dA0dCC8ab94c2917`