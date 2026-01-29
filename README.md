# Solana Auto Volume Bot (No-Popup)

**Click to try it out:** [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://321802282.github.io/sol-auto-tx)

A lightweight Solana trading bot built with Vite, React, and TypeScript. It utilizes the Jupiter V1 API to perform automated token hedging (Ping-Pong mode), designed to help users generate on-chain volume without constant manual wallet confirmations.

## 🚀 Key Features

- **Automated Trading**: Start once to execute automated buy and sell loops.
- **Ping-Pong Strategy**: After a forward trade (e.g., SOL -> USDC), it automatically sells the total output back (USDC -> SOL) to maintain balance.
- **No-Popup Signing**: Direct local signing with a private key, eliminating the need for constant wallet extension interaction.
- **Sybil Protection**:
  - **Random Amount Interval**: Trades execute with a random amount between your set Min and Max values.
  - **Random Time Interval**: Delays between trades are randomized within your configured Min and Max duration.
- **Robust Error Handling**:
  - Auto-skip reverse trade failures to prevent loops from getting stuck.
  - Optimized 10s confirmation timeout for faster execution.
- **Multi-language Support**: Seamless toggle between Chinese and English UI.
- **Decoupled Architecture**: Logic, components, constants, and types are separated for high maintainability.

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (v8+ recommended)
- A Solana wallet private key (Use a **Burner Wallet** with minimal funds for safety)
- A high-quality RPC URL (**Free Registration:** [Helius](https://www.helius.dev/))
- Jupiter API Key (**Free Registration:** [Jupiter Dashboard](https://portal.jup.ag/dashboard))

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Development Server**:
   ```bash
   pnpm dev
   ```

3. **Access the App**:
   Open your browser and navigate to `http://localhost:5173`.

4. **Configure and Run**:
   - Enter your **RPC URL**.
   - Enter your **Private Key (Base58 format)**.
  - Set **Min/Max Amount**, **Loop Count**, and **Min/Max Interval**.
  - Click **"Start Auto-Trade"**.

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Cryptocurrency trading involves significant risk. Always use a test wallet with small amounts. The author is not responsible for any financial losses incurred through the use of this script.

## ☕ Donation

If this tool helped you, feel free to buy me a coffee!

**SOL Address:** `FKVCYeL4sLhLTuE71f6rzc8G3YuH62m8kswbHSp33Sb6`
