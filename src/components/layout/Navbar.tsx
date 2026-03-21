'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './ThemeToggle';

function formatAddress(address: string | undefined): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const NAV_LINKS = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/mint', label: 'Mint' },
    { href: '/vault', label: 'Vault' },
    { href: '/profile', label: 'Profile' },
    { href: '/fees', label: 'Fees' },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
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
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'text-sm transition-colors hover:text-primary',
                                pathname === link.href
                                    ? 'text-primary font-medium'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side: Chain info + Wallet + Mobile toggle */}
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

                    {/* Mobile hamburger button */}
                    <button
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 md:hidden"
                        aria-label="Toggle navigation menu"
                    >
                        <div className="flex flex-col items-center justify-center gap-[5px]">
                            <span
                                className={cn(
                                    'block h-[2px] w-4 rounded-full bg-foreground transition-all duration-300',
                                    mobileOpen && 'translate-y-[7px] rotate-45',
                                )}
                            />
                            <span
                                className={cn(
                                    'block h-[2px] w-4 rounded-full bg-foreground transition-all duration-300',
                                    mobileOpen && 'opacity-0',
                                )}
                            />
                            <span
                                className={cn(
                                    'block h-[2px] w-4 rounded-full bg-foreground transition-all duration-300',
                                    mobileOpen && '-translate-y-[7px] -rotate-45',
                                )}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile menu drawer */}
            <div
                className={cn(
                    'overflow-hidden border-t border-border bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden',
                    mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-0',
                )}
            >
                <nav className="flex flex-col gap-1 px-4 py-3">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                pathname === link.href
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Chain badge in mobile menu */}
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs sm:hidden">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Cronos Testnet</span>
                    </div>
                </nav>
            </div>
        </header>
    );
}