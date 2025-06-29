# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm run dev` - Start Next.js development server (port 3000)
- `pnpm run build` - Build the Next.js application
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint for code quality

### Blockchain Development
- `pnpm run compile` - Compile Solidity contracts using Hardhat
- `pnpm run test` - Run Hardhat tests for smart contracts
- `pnpm run node` or `pnpm run dev:blockchain` - Start local Hardhat blockchain node
- `pnpm run deploy` - Deploy contracts to local network using Ignition
- `pnpm run dev:all` - Run both blockchain node and Next.js dev server concurrently

## Architecture Overview

This is a decentralized token farm application built with Next.js frontend and Solidity smart contracts. The application allows users to stake DIA tokens and earn DAPP token rewards.

### Smart Contract Architecture
- **TokenFarm.sol** - Main staking contract that manages token staking/unstaking and reward distribution
- **DiaToken.sol** - ERC-20 token used for staking
- **DappToken.sol** - ERC-20 reward token distributed to stakers
- Contracts use Solidity 0.5.0 and 0.8.28 (dual compiler setup)

### Frontend Architecture
- **Next.js 15** with React 19 and TypeScript
- **Client-side only** (`'use client'`) - no SSR for blockchain interactions
- **Mock implementation** - current frontend uses simulated blockchain interactions for demo purposes
- **Web3 Integration** - Ready for MetaMask wallet connection with Base Sepolia and Base Mainnet support
- **Component Structure**:
  - Page components in `src/app/`
  - Reusable UI components in `src/components/`
  - Type definitions in `src/types/`

### Key Integration Points
- Contract deployment managed by Hardhat Ignition in `ignition/modules/TokenFarm.ts`
- TypeChain generates TypeScript bindings for contracts in `typechain-types/`
- Local development uses Hardhat node on chainId 31337

### Network Configuration
- **Local**: http://127.0.0.1:8545 (Hardhat node)
- **Default Demo Network**: Base Sepolia Testnet
- **Production**: Base Mainnet
- Frontend includes automatic network switching prompts

### State Management
- React state for wallet connection and balances
- Mock reward calculation system updates every minute for demo
- No external state management library - uses built-in React state

## Development Workflow

1. Start local blockchain: `pnpm run dev:blockchain`
2. Deploy contracts: `pnpm run deploy` 
3. Start frontend: `pnpm run dev`
4. Or run both: `pnpm run dev:all`

For smart contract changes: compile → test → deploy sequence.
For frontend changes: standard Next.js hot reload workflow.