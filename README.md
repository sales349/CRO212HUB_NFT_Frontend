# CRO212HUB NFT Generator & Launchpad - Frontend

Next.js frontend for the CRO212HUB NFT Generator and Launchpad platform. Includes admin dashboard and public mint page with Reown AppKit wallet integration.

## Features

### Phase 1 (Complete ✅)
- **Public Mint Page** - NFT minting interface with wallet connection
- **Reown AppKit Integration** - Multi-wallet support (MetaMask, Crypto.com DeFi Wallet, WalletConnect)
- **Cronos Network Support** - Testnet and Mainnet
- **Balance Checking** - Prevents minting with insufficient funds
- **Transaction Confirmation** - Shows tx hash and links to CronosScan

### Phase 2 - Milestone 1 (Complete ✅)
- **Admin Dashboard** - Phase 2 status page at `/admin`
- **Projects List** - View all NFT projects at `/admin/projects`
- **Production Build** - Webpack-based build working

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19.2.0
- **Web3:** Reown AppKit + Ethers.js v6
- **Styling:** Pure CSS (no frameworks)
- **Build:** Webpack (configured for WalletConnect compatibility)

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Installation

1. **Navigate to frontend folder:**
   ```bash
   cd frontend-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will run on **http://localhost:3001** (or 3000 if available)

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## Project Structure

```
frontend-repo/
├── app/
│   ├── layout.js              # Root layout with AppKitProvider
│   ├── page.js                # Public mint page (/)
│   ├── globals.css            # Global styles
│   ├── admin/                 # Admin dashboard
│   │   ├── page.js            # Admin home (/admin)
│   │   └── projects/
│   │       └── page.js        # Projects list (/admin/projects)
├── context/
│   └── AppKitProvider.js      # Reown AppKit configuration
├── lib/
│   ├── contract.js            # Contract address and ABI
│   └── launchpad.js           # Contract interaction functions
├── next.config.js             # Next.js configuration (webpack mode)
├── package.json
└── README.md                  # This file
```

## Routes

### Public Routes
- **`/`** - NFT Mint Page
  - Connect wallet
  - Select quantity
  - Mint NFTs
  - View balance and minted count

### Admin Routes
- **`/admin`** - Admin Dashboard
  - System status (Backend, Database, Milestones)
  - Quick actions
  - Development roadmap

- **`/admin/projects`** - Projects List
  - View all NFT projects
  - Project cards with stats
  - Create new projects (M2)

## Configuration

### Reown AppKit

The AppKit configuration is in `context/AppKitProvider.js`:

```javascript
const projectId = "d7f6ee088f34fc3e8748068a551d5954";
```

Supports:
- Cronos Testnet (Chain ID: 338)
- Cronos Mainnet (Chain ID: 25)

### Contract Address

Current deployed contract (Test Collection):
```
0x97A26591f2263490BfADd0EeD6651CB50B1b6D20
```

Update in `lib/contract.js` for different projects.

## Development

### Running Locally
```bash
npm run dev
```

Starts dev server with hot reload on http://localhost:3001

### Building for Production
```bash
npm run build
```

Creates optimized production build using webpack (not Turbopack).

**Note:** Uses `--webpack` flag due to WalletConnect/Supabase compatibility issues with Turbopack.

### Testing
```bash
# Visit admin dashboard
http://localhost:3001/admin

# Visit projects page
http://localhost:3001/admin/projects

# Visit mint page
http://localhost:3001/
```

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel

2. **Configure build settings:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Deploy!**

The build command automatically uses webpack mode.

### Other Platforms

Works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Troubleshooting

### Build Errors with Turbopack
```
ERROR: This build is using Turbopack, with a `webpack` config...
```

**Solution:** Already fixed! The build script uses `--webpack` flag.

### Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:** Next.js will automatically use port 3001 if 3000 is occupied.

### WalletConnect Issues
```
Cannot find module '@walletconnect/...'
```

**Solution:**
```bash
npm install
```

Ensure all dependencies are installed.

## Environment Variables

Currently no environment variables required for frontend.

In future milestones, you may need:
```env
NEXT_PUBLIC_BACKEND_API=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps

- **Milestone 2:** Connect admin dashboard to backend API
- **Milestone 5:** Full admin dashboard with project management
- **Milestone 6:** Dynamic mint page supporting multiple projects

## Security Notes

- Only connects to Cronos blockchain (no private keys stored)
- Uses Reown AppKit for secure wallet connections
- All transactions require user approval in wallet
- Balance checking prevents failed transactions

## Support

For issues or questions:
1. Check this README
2. Review Phase 1 mint page implementation
3. Check browser console for errors

## License

ISC License - CRO212HUB Platform
