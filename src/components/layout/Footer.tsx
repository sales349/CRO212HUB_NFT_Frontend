import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border bg-background-secondary">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <span className="text-lg font-bold tracking-wider text-primary">
                            CRO212HUB
                        </span>
                        <p className="mt-3 text-sm text-muted-foreground">
                            NFT Platform on Cronos. Create, mint, trade with low fees.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-primary">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/mint" className="text-sm text-muted-foreground hover:text-primary">
                                    Mint
                                </Link>
                            </li>
                            <li>
                                <Link href="/vault" className="text-sm text-muted-foreground hover:text-primary">
                                    Vault
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/transparency" className="text-sm text-muted-foreground hover:text-primary">
                                    Fee Transparency
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://cronos.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    About Cronos
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Chain Status */}
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Chains</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-muted-foreground">Cronos — Active</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="text-muted-foreground">Ethereum — Coming Soon</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="text-muted-foreground">Solana — Coming Soon</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} CRO212HUB. All rights reserved. Built on Cronos.
                </div>
            </div>
        </footer>
    );
}