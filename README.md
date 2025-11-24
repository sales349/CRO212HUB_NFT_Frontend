# CRO212HUB NFT Launchpad - Frontend

Next.js mint page for CRO212HUB NFT collections on Cronos.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Reown AppKit (WalletConnect) - Wallet connection
- Ethers.js v6 - Smart contract interactions
- Pure CSS - Styling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The WalletConnect Project ID is already configured, but you can get your own at:
https://cloud.reown.com

### 3. Configure Contract

Edit `lib/contract.js` and set your deployed contract address:

```javascript
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

### 4. Update Collection Info

Edit `app/page.js` and update:

```javascript
const COLLECTION_NAME = "Your Collection Name";
const COLLECTION_DESCRIPTION = "Your collection description";
```

## Development

Run the development server:

```bash
npm run dev
```

Visit: http://localhost:3000

## Production

Build and start:

```bash
npm run build
npm start
```

## Features

✅ Multi-wallet support (MetaMask, Crypto.com DeFi Wallet, WalletConnect)
✅ Real-time contract data updates
✅ Responsive design (mobile-friendly)
✅ Network detection (Cronos Mainnet/Testnet)
✅ Transaction status with Cronoscan links
✅ Quantity selector with limits
✅ Auto-refresh every 10 seconds

## Project Structure

```
frontend-repo/
├── app/
│   ├── layout.js       # Root layout with AppKit
│   ├── page.js         # Main mint page
│   └── globals.css     # Styles
├── context/
│   └── AppKitProvider.js  # WalletConnect config
├── lib/
│   ├── contract.js     # Contract address & ABI
│   └── launchpad.js    # Contract functions
├── package.json
└── next.config.js
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variable: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy!

### Other Platforms

Build the project:
```bash
npm run build
```

Deploy the `.next` folder to your hosting platform.

## Troubleshooting

### Wallet Won't Connect
- Clear browser cache
- Try a different wallet
- Check browser console for errors

### Contract Not Loading
- Verify `CONTRACT_ADDRESS` in `lib/contract.js`
- Ensure contract is deployed
- Check you're on correct network

### Transactions Failing
- Ensure public sale is active
- Check you have enough CRO
- Verify you haven't exceeded max per wallet

## License

MIT
