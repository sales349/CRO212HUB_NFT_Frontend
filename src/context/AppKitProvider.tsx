'use client';

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { ThemeProvider } from 'next-themes';
import type { AppKitNetwork } from '@reown/appkit/networks';
import {
  cronosTestnet,
  cronosMainnet,
  walletConnectProjectId,
} from '@/config/web3';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const metadata = {
  name: 'CRO212HUB',
  description: 'NFT Platform on Cronos',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://cro212hub.com',
  icons: ['/icon-192x192.png'],
};

// Cast to mutable array for AppKit compatibility
const networks = [cronosTestnet, cronosMainnet] as [AppKitNetwork, ...AppKitNetwork[]];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: walletConnectProjectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId: walletConnectProjectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00D1FF',
    '--w3m-border-radius-master': '2px',
  },
});

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}