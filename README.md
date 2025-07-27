# 🤖 Solana Telegram Bot – Auto Invest, Swap, and Distribute

This Node.js application integrates with Telegram, the Solana blockchain, and MongoDB to create a simple DeFi automation system. It accepts SOL deposits from users via Telegram, swaps them to tokens, tracks investments, and distributes profits proportionally every 7 days.

---

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Maher-alhomsy-se/solana-bot.git
   cd solana-bot
   ```

---

## Install dependencies

```bash
npm i
```

---

## Set up environment variables

1. **Create a .env file in the project root with the following:**

```env
PRIVATE_KEY_BASE58=your_solana_wallet_private_key_in_base58
DB_URL=your_mongodb_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

---

## 🚀 Running the Project

1. **Start the bot using:**

```bash
npm start
```

This will launch the Telegram bot and schedule the weekly cron job.

## 💡 Project Idea

This bot automates token purchases and weekly profit distribution based on user deposits.

## ✅ Workflow

A. Accept SOL deposits via Telegram

- Users send SOL to your wallet address

- Bot stores user info and SOL amount in MongoDB

B. Swap SOL to Tokens

- Automatically swaps incoming SOL to tokens using the Jupiter Aggregator

- Stores token mint, hash, value, and boughtAt timestamp in the DB

C. Weekly Cron Job

- Runs every 7 days inside index.js

- Fetches all tokens bought in the last 7 days

- Fetches all users who sent SOL in the last 7 days

D. Sell Tokens (Token → SOL)

- All tokens are swapped back to SOL

E. Fetch Total Balance

- The bot calculates the total amount of SOL after selling the tokens

F. Profit Split

- Keeps 20% for the bot owner

- Distributes 80% among users

G. Distribution Calculation

- Each user’s share is calculated based on how much SOL they sent compared to the total amount

H. Send SOL to Each User

- The calculated amount of SOL is sent to each user’s wallet

I. Reset & Log History

- Clears the total balance collection

- Logs the balance, timestamp, and users in a balance_history collection

## 🛠 Tech Stack

- Node.js – Backend

- node-telegram-bot-api – Telegram bot SDK

- @solana/web3.js – Solana blockchain API

- @jup-ag/api – Jupiter Aggregator for swaps

- MongoDB – Data persistence

- node-cron – Scheduled weekly tasks
