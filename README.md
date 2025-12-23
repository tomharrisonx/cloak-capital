# Cloak Capital

Cloak Capital is a privacy-first fundraising app built on FHEVM. It lets a fundraiser
define a campaign name, target amount, and end time while contributors send encrypted
wETH amounts. Individual contributions and the total raised remain confidential on-chain,
yet authorized participants can decrypt their own values when needed.

## Overview

Traditional on-chain fundraising exposes every contribution amount, making donors
visible to the public and discouraging participation. Cloak Capital replaces clear-text
accounting with fully homomorphic encryption (FHE) so funding can stay private without
losing on-chain settlement or composability.

## Problems This Solves

- Public block explorers reveal every donation amount.
- Competitors can track fundraising momentum in real time.
- Donors cannot participate privately while still trusting the campaign ledger.
- Off-chain spreadsheets introduce trust and reconciliation risk.

## Advantages

- Confidential contributions and totals using Zama FHE.
- On-chain accounting without revealing amounts.
- Owner-controlled decryption for campaign totals.
- Contributor-controlled decryption for personal totals.
- No need for off-chain ledgers or private databases.
- Event metadata stays minimal; only an optional note is public.

## Core Features

- Campaign configuration: name, target, and end time.
- Encrypted contributions through a confidential ERC-7984 token.
- Encrypted per-contributor ledger and encrypted total raised.
- Contribution acceptance is blocked after the end time.
- Owner can update campaign settings while active.
- Owner can end fundraising anytime and withdraw all wETH.
- Frontend tools to mint test wETH, contribute, and decrypt values.

## Architecture and Data Flow

Components:
- WrapETH: confidential ERC-7984 token used for encrypted transfers.
- CloakFundraiser: campaign contract that records encrypted contributions.
- Frontend: React app for contributors and owner actions.
- Zama relayer SDK: decrypts handles using wallet signatures.

Flow:
1) Contributor encrypts amount client-side.
2) WrapETH confidentialTransferAndCall sends encrypted amount.
3) CloakFundraiser records encrypted per-user and total amounts.
4) Authorized users decrypt handles via Zama relayer + EIP-712 signature.
5) Owner ends campaign and withdraws all wETH.

```
Wallet -> WrapETH (confidentialTransferAndCall) -> CloakFundraiser
         -> encrypted contribution handle (per user)
         -> encrypted total handle (owner)
Wallet + Zama relayer -> decrypt handles when permitted
```

## Smart Contracts

### CloakFundraiser

- Stores campaign metadata: name, target amount, end time, and owner.
- Records encrypted contributions in a per-address mapping.
- Maintains an encrypted total raised value.
- Allows owner to update campaign settings before it ends.
- Blocks contributions after end time or manual end.
- Ends the campaign and withdraws all wETH to the owner.

Key functions:
- `updateCampaign(name, targetAmount, endTime)`
- `endFundraising()`
- `contributionOf(address)`
- `totalRaised()`
- `isActive()` and `isEnded()`

### WrapETH

- Confidential ERC-7984 token for test usage.
- Public `mint(address, amount)` for testnet flows.
- Used by the fundraiser as the contribution asset.

### FHECounter (Example)

- Sample FHE contract included for reference only.

## Frontend

The frontend lives in `src/` and provides:
- Wallet connect (RainbowKit + wagmi).
- Read-only contract data using viem.
- Contract writes using ethers.
- Encrypted contribution workflow with Zama relayer SDK.
- Decryption of encrypted handles with EIP-712 signatures.
- Owner controls for campaign updates and withdrawals.

## Tech Stack

Smart contracts:
- Solidity 0.8.27
- Hardhat + hardhat-deploy
- Zama FHEVM (FHE library, config)
- OpenZeppelin Confidential Contracts (ERC-7984)

Frontend:
- React + Vite
- wagmi + RainbowKit
- ethers (write) + viem (read)
- @zama-fhe/relayer-sdk
- TanStack Query

Testing and tooling:
- Hardhat tests (mock + Sepolia)
- TypeChain (ethers v6)
- ESLint + Prettier

## Repository Layout

```
contracts/           Smart contracts
deploy/              Deployment scripts
tasks/               Hardhat tasks
test/                Hardhat tests
docs/                Zama references
src/                 Frontend (React + Vite)
```

## Prerequisites

- Node.js 20+
- npm
- A wallet funded for Sepolia
- Infura API key for Sepolia deployments
- Private key for deployments (use PRIVATE_KEY, not a mnemonic)

## Install Dependencies

Root (contracts + tasks):
```
npm install
```

Frontend:
```
cd src
npm install
```

## Environment Configuration (Contracts)

Set these in your shell or `.env` file for contract deployments:
- `INFURA_API_KEY` (required for Sepolia)
- `PRIVATE_KEY` (required for Sepolia)
- `ETHERSCAN_API_KEY` (optional for verification)
- `FUND_NAME`, `FUND_TARGET`, `FUND_END_TIME` (optional defaults for deploy script)

## Compile and Test

```
npm run compile
npm run test
```

Sepolia test suite (requires deployed contracts on Sepolia):
```
npm run test:sepolia
```

## Deploy Contracts

Local Hardhat network:
```
npm run deploy:localhost
```

Sepolia:
```
npm run deploy:sepolia
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

After deployment, Hardhat deploy writes artifacts and ABIs to
`deployments/sepolia`. Use those ABIs for the frontend.

## Hardhat Tasks

```
npx hardhat accounts
npx hardhat fundraiser:address
npx hardhat fundraiser:status --address <FUNDRAISER_ADDRESS>
npx hardhat fundraiser:contribute --amount 500 --address <FUNDRAISER_ADDRESS>
npx hardhat fundraiser:decrypt-total --address <FUNDRAISER_ADDRESS>
npx hardhat fundraiser:decrypt-contribution --contributor <ADDRESS> --address <FUNDRAISER_ADDRESS>
```

## Frontend Setup

1) Set the deployed contract addresses in `src/src/config/contracts.ts`.
2) Copy the deployed ABI from `deployments/sepolia` into the same file.
3) Set WalletConnect project ID in `src/src/config/wagmi.ts`.
4) The frontend is configured for Sepolia only.

Run the app:
```
cd src
npm run dev
```

## Usage Guide

1) Deploy `WrapETH` and `CloakFundraiser` to Sepolia.
2) Update frontend addresses and ABI in `src/src/config/contracts.ts`.
3) Connect your wallet in the UI.
4) Mint test wETH using the "Wallet Tools" section.
5) Contribute with an encrypted amount.
6) Decrypt your own contribution and token balance.
7) If you are the owner, decrypt the total raised.
8) Update campaign settings or end fundraising and withdraw.

## Security Notes and Limitations

- Contracts are not audited.
- `WrapETH` mint is unrestricted for testing.
- Target amount is informational; the contract does not auto-stop at target.
- Encrypted values use `euint64` and have a fixed numeric range.
- Decryption requires the Zama relayer SDK and a wallet signature.
- Optional contribution notes are stored on-chain in clear text.

## Future Roadmap

- Campaign factory for multi-raise management.
- Configurable caps, minimums, and automatic target enforcement.
- Refund flows for cancelled or failed campaigns.
- Owner multi-sig support.
- Contribution history and analytics in the UI.
- Support for additional confidential assets.

## Documentation

- Zama FHEVM docs: https://docs.zama.ai/fhevm
- Local references: `docs/zama_llm.md`, `docs/zama_doc_relayer.md`

## License

BSD-3-Clause-Clear. See `LICENSE`.
