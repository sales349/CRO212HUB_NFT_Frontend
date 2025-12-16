// AppKit Provider - Reown AppKit (WalletConnect) Provider for Web3 wallet connection

'use client';

import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { supportedChains, walletConnectProjectId } from '@/config/web3';

// App metadata
const metadata = {
  name: 'CRO212HUB NFT Generator',
  description: 'NFT Generator & Launchpad for Cronos Blockchain',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks: supportedChains,
  metadata,
  projectId: walletConnectProjectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#667eea',
    '--w3m-border-radius-master': '8px',
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
