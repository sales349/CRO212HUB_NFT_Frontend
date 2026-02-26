import type { Metadata, Viewport } from 'next';
import { AppKitProvider } from '@/context/AppKitProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CRO212HUB — NFT Platform on Cronos',
    template: '%s | CRO212HUB',
  },
  description: 'Create, mint, and trade NFTs on Cronos blockchain with low fees.',
  keywords: ['NFT', 'Cronos', 'Blockchain', 'Web3', 'Marketplace', 'Mint'],
  authors: [{ name: 'CRO212HUB' }],
  openGraph: {
    title: 'CRO212HUB — NFT Platform on Cronos',
    description: 'Create, mint, and trade NFTs on Cronos blockchain with low fees.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRO212HUB',
    description: 'NFT Platform on Cronos',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <AppKitProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#111111',
                border: '1px solid #27272a',
                color: '#ffffff',
              },
            }}
          />
        </AppKitProvider>
      </body>
    </html>
  );
}