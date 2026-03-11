# CRO212HUB NFT Platform — Frontend

Next.js 16 frontend for the CRO212HUB NFT platform on Cronos. Features AI-powered NFT generation, vault/preset management, marketplace with infinite scroll, avatar builder, and wallet integration via Reown AppKit.

## Tech Stack

| Component | Technology |
|:----------|:-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **React** | React 19 |
| **Wallet** | Reown AppKit (`@reown/appkit`) + wagmi v3 |
| **Web3** | viem — chain config, contract ABI, read/write prep |
| **Styling** | Tailwind CSS + custom design system (dark mode default) |
| **UI** | Custom components (shadcn/ui-inspired) + lucide-react icons |
| **Animation** | Framer Motion |
| **Data Fetching** | TanStack Query v5 (`useQuery`, `useInfiniteQuery`, `useMutation`) |
| **Validation** | Zod |
| **Toasts** | Sonner |
| **Charts** | Recharts |
| **Themes** | next-themes (dark default) |
| **PWA** | manifest.json + icons |

## Project Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout (AppKitProvider, Navbar, Footer, Toaster)
│   ├── page.tsx                      # Landing page (hero, features, fee transparency)
│   ├── mint/page.tsx                 # AI NFT generation → preview → save to vault
│   ├── vault/page.tsx                # Saved presets grid (sort, delete, sell → ListingModal)
│   ├── remix/page.tsx                # Trait editor → remix → save
│   ├── avatar-builder/page.tsx       # 512×512 export, badge position, Telegram share
│   ├── marketplace/page.tsx          # Listings grid, infinite scroll, filters, stats bar
│   ├── market/[nftId]/page.tsx       # Detail: expandable sections (traits, rarity, metadata, activity)
│   ├── my-projects/                  # Project management (create, upload traits, generate, deploy)
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── generate/page.tsx
│   │       ├── upload-traits/page.tsx
│   │       └── deploy/page.tsx
│   └── project/[id]/page.tsx         # Public project view
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Navigation + wallet connect button
│   │   ├── Footer.tsx                # Site footer
│   │   └── ThemeToggle.tsx           # Dark/light toggle
│   ├── marketplace/
│   │   ├── FilterBar.tsx             # Search, sort, price range, rarity filter
│   │   ├── ListingCard.tsx           # NFT listing card
│   │   └── StatsBar.tsx              # 4-stat cards (active, floor, avg, volume)
│   ├── mint/
│   │   ├── GenerateForm.tsx          # Trait selection + prompt form
│   │   ├── NFTPreview.tsx            # Generated NFT preview card
│   │   ├── RarityBadge.tsx           # Rarity rank badge
│   │   ├── RarityBreakdown.tsx       # Detailed rarity breakdown
│   │   └── TraitSelector.tsx         # Single trait dropdown
│   ├── vault/
│   │   ├── ListingModal.tsx          # Create marketplace listing modal
│   │   ├── PresetCard.tsx            # Vault preset card
│   │   └── PresetGrid.tsx            # Vault preset grid layout
│   └── ui/
│       ├── Badge.tsx                 # Generic badge
│       └── Skeleton.tsx              # Loading skeletons
├── config/
│   └── web3.ts                       # Cronos chain definitions (25/338), WalletConnect project ID
├── context/
│   └── AppKitProvider.tsx            # Reown AppKit + wagmi + QueryClient + ThemeProvider
├── lib/
│   ├── api/                          # Backend API clients (fetch wrappers)
│   │   ├── client.ts                 # Base client with auth headers
│   │   ├── generate.ts               # AI generation API
│   │   ├── generation.ts             # Generation helpers
│   │   ├── marketplace.ts            # Marketplace CRUD
│   │   ├── projects.ts               # Project management
│   │   ├── rarity.ts                 # Rarity API
│   │   ├── traits.ts                 # Trait options
│   │   ├── vault.ts                  # Vault CRUD
│   │   └── index.ts                  # Re-exports
│   ├── hooks/                        # TanStack Query hooks
│   │   ├── useAuth.ts                # JWT auth + auto-authenticate
│   │   ├── useGenerateNFT.ts         # Generate mutation
│   │   ├── useGeneration.ts          # Generation helpers
│   │   ├── useMarketplace.ts         # useListings (infinite), useListing, useMarketStats, useCreateListing, useCancelListing
│   │   ├── useProjects.ts            # Project CRUD hooks
│   │   ├── useRarity.ts              # Rarity queries
│   │   ├── useTraits.ts              # Trait options
│   │   ├── useVault.ts               # Vault CRUD + remix + avatar
│   │   └── index.ts                  # Re-exports
│   ├── contracts/
│   │   └── nft-contract.ts           # NFT contract ABI + bytecode
│   └── utils/
│       ├── cn.ts                     # Tailwind class merge utility
│       ├── constants.ts              # App constants
│       ├── formatting.ts             # Address/date formatters
│       ├── validation.ts             # Zod schemas
│       └── index.ts                  # Re-exports
├── types/                            # TypeScript type definitions
│   ├── generator.ts                  # Trait options, rarity types, preset types
│   ├── index.ts                      # Shared types (listings, marketplace, etc.)
│   └── ...
public/
├── manifest.json                     # PWA manifest
├── icon-192x192.png                  # PWA icon (192px)
└── icon-512x512.png                  # PWA icon (512px)
```

## Pages & Features

### Landing (`/`)
- Animated hero section with Framer Motion
- Feature cards (AI Generation, Marketplace, Vault & Remix, Low Fees)
- Fee transparency section (2% primary, 6% secondary)
- SEO metadata (title, description, OG, Twitter)

### Mint (`/mint`)
- Trait selector → prompt → generate via AI V1 engine
- Live preview with rarity badge/breakdown
- Save to vault, mint placeholder (Week 5: real viem `writeContract`)

### Vault (`/vault`)
- Preset grid with sort (newest/oldest/rarity)
- Delete presets, sell → ListingModal → marketplace
- Auto-auth on wallet connect

### Remix (`/remix?preset=ID`)
- Load preset traits, modify with live change tracking
- Create remix → save to vault

### Avatar Builder (`/avatar-builder?preset=ID`)
- 512×512 canvas export with badge overlay
- 5 badge positions (4 corners + none)
- Telegram deep-link share

### Marketplace (`/marketplace`)
- **Infinite scroll** via IntersectionObserver + TanStack `useInfiniteQuery`
- **FilterBar:** search, 5 sort options, price range, rarity filter, clear all
- **StatsBar:** 4 stat cards (active listings, floor, avg price, volume)
- Skeleton loading states, empty state, error handling

### NFT Detail (`/market/[nftId]`)
- Large preview image with status badge (sold/cancelled)
- Price display with fee note for secondary sales
- **4 expandable sections:**
  - Traits (with percentage bars per trait)
  - Rarity Details (animated score bar + rank badge)
  - Metadata & Links (token ID, chain, IPFS link, contract)
  - Activity (placeholder for Week 5 on-chain history)
- Buy Now button (placeholder for Week 5)

## Setup

### Prerequisites
- Node.js 20+
- Backend API running (see Backend README)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3002

# Reown / WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Cronos RPC (optional — defaults exist)
NEXT_PUBLIC_CRONOS_MAINNET_RPC=https://evm.cronos.org
NEXT_PUBLIC_CRONOS_TESTNET_RPC=https://evm-t3.cronos.org

# Default chain: 'testnet' or 'mainnet'
NEXT_PUBLIC_DEFAULT_CHAIN=testnet

# Contract address (for on-chain integration)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (`--webpack` flag for compatibility) |
| `npm start` | Start production server |
| `npm run lint` | Lint check |

## Design System

- **Background:** `#0A0A0A` / `#111111` (dark default)
- **Primary accent:** `#00D1FF` (cyan/teal) — buttons, links, badges, glow effects
- **Secondary accent:** Purple/coral — rarity, stats
- **Typography:** System fonts via Tailwind
- **Dark mode:** Default, toggleable via next-themes

## Wallet Integration

- **Reown AppKit** provides 500+ wallet connections
- **wagmi v3** for hooks (`useAccount`, `useWriteContract`, etc.)
- **viem** for chain definitions and contract interaction
- Cronos testnet (338) as default, mainnet (25) switchable

## Current Status

- ✅ Weeks 1–2: Infrastructure + Mint/Vault/Remix/Avatar Builder
- ✅ Week 3: Marketplace (infinite scroll, filters, detail page with expandable sections)
- ⬜ Weeks 4–6: Profile, admin flags, buy flow with fees, on-chain integration

## License

ISC License — CRO212HUB Platform
