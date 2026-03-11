'use client';

import Link from 'next/link';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './ThemeToggle';

function formatAddress(address: string | undefined): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Navbar() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-wider text-primary">
                        CRO212HUB
                    </span>
                </Link>

                {/* Nav Links - Desktop */}
                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/marketplace"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/mint"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        Mint
                    </Link>
                    <Link
                        href="/vault"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        Vault
                    </Link>
                    <Link
                        href="/profile"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        Profile
                    </Link>
                    <Link
                        href="/fees"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        Fees
                    </Link>
                </nav>

                {/* Right side: Chain info + Wallet */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {/* Chain badge */}
                    <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs sm:flex">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Cronos Testnet</span>
                    </div>

                    {/* Coming soon chains */}
                    <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs lg:flex">
                        <span className="text-muted-foreground">ETH</span>
                        <span className="text-xs text-muted-foreground/50">Soon</span>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs lg:flex">
                        <span className="text-muted-foreground">SOL</span>
                        <span className="text-xs text-muted-foreground/50">Soon</span>
                    </div>

                    {/* Connect / Address */}
                    {isConnected ? (
                        <button
                            onClick={() => open()}
                            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs text-primary transition-all hover:bg-primary/20"
                        >
                            {formatAddress(address)}
                        </button>
                    ) : (
                        <button
                            onClick={() => open()}
                            className={cn(
                                'rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground',
                                'transition-all hover:opacity-90 glow-hover',
                            )}
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}