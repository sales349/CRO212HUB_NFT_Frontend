// Root Layout - Main layout with providers and metadata

import type { Metadata, Viewport } from 'next';
import { AppKitProvider } from '@/context/AppKitProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CRO212HUB NFT Generator',
  description: 'NFT Generator & Launchpad for Cronos Blockchain',
  keywords: ['NFT', 'Generator', 'Cronos', 'Blockchain', 'Web3', 'Launchpad'],
  authors: [{ name: 'CRO212HUB' }],
  openGraph: {
    title: 'CRO212HUB NFT Generator',
    description: 'Create, generate, and launch your NFT collection on Cronos blockchain',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRO212HUB NFT Generator',
    description: 'Create, generate, and launch your NFT collection on Cronos blockchain',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
