# GenLayer Bounty Review

Next.js frontend for GenLayer Bounty Review - AI-powered developer tasks and trustless work evaluation on the GenLayer blockchain.

## Setup

1. Install dependencies:

**Using bun:**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` - GenLayer Football Betting contract address
   - `NEXT_PUBLIC_STUDIO_URL` - GenLayer Studio URL (default: https://studio.genlayer.com/api)

## Development

**Using bun:**
```bash
bun dev
```

**Using npm:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

**Using bun:**
```bash
bun run build
bun start
```

**Using npm:**
```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom glass-morphism theme
- **genlayer-js** - GenLayer blockchain SDK
- **TanStack Query (React Query)** - Data fetching and caching
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built UI components

## Wallet Management

The app uses GenLayer's account system:
- **Create Account**: Generate a new private key
- **Import Account**: Import existing private key
- **Export Account**: Export your private key (secured)
- **Disconnect**: Clear stored account data

Accounts are stored in browser's localStorage for development convenience.

## Features

- **Post Bounties**: Create developer tasks specifying a title, evaluation criteria, and a locked token reward
- **View Bounties**: Real-time bounty table with task details, criteria, status, and creators
- **Submit Work**: Developers can submit work URLs for trustless AI evaluation via GenLayer's GenVM  
- **AI Evaluation** Logs: Track recent submission evaluations, passing statuses, and automated feedback  - **Glass-morphism UI**: Premium dark theme with backdrop blur effects and smooth animations  
- **Real-time** Updates: Automatic data fetching via TanStack Query 


## Smart Contract & Consensus Logic

The complete Intelligent Contract source code can be found in /contracts/bounty_contract.py.

- **Evaluation & Validator Logic**: Utilizes GenVM's gl.nondet.exec_prompt to achieve AI consensus on submission quality.

- **State Transitions & Payout**: The contract autonomously updates is_open, logs the winner_address, and locks the escrow state once the criteria are met.