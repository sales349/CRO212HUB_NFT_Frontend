'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFees } from '@/lib/hooks/useFees';

function FeeSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <span className="text-2xl">{icon}</span>
                {title}
            </h2>
            {children}
        </div>
    );
}

function PercentBadge({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-mono text-sm font-bold text-primary">
                {(value * 100).toFixed(0)}%
            </span>
        </div>
    );
}

export default function FeesPage() {
    const { data: fees, isLoading, error } = useFees();
    const [calcPrice, setCalcPrice] = useState<string>('100');

    if (isLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !fees) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-5xl">⚠️</div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">Failed to load fee info</h2>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'Please try again later.'}
                    </p>
                </div>
            </div>
        );
    }

    const price = parseFloat(calcPrice) || 0;
    const buyerFee = price * fees.secondarySale.buyerFee;
    const sellerFee = price * fees.secondarySale.sellerFee;
    const royalties = price * fees.royalties.default;

    return (
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Fee Transparency
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Full breakdown of platform fees, royalties, and treasury allocations.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Primary Mints */}
                    <FeeSection title="Primary Mints" icon="🎨">
                        <PercentBadge
                            value={fees.primaryMint.platformFee}
                            label="Platform fee (deducted from creator)"
                        />
                        <p className="mt-3 text-sm text-muted-foreground">
                            {fees.primaryMint.description}
                        </p>
                        <div className="mt-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400">
                            ✅ {fees.primaryMint.buyerPays}
                        </div>
                    </FeeSection>

                    {/* Secondary Sales */}
                    <FeeSection title="Secondary Sales" icon="🔄">
                        <div className="space-y-2">
                            <PercentBadge value={fees.secondarySale.buyerFee} label="Buyer service fee (add-on)" />
                            <PercentBadge value={fees.secondarySale.sellerFee} label="Seller deduction" />
                            <PercentBadge value={fees.secondarySale.totalPlatform} label="Total platform fee" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {fees.secondarySale.description}
                        </p>
                    </FeeSection>

                    {/* Royalties */}
                    <FeeSection title="Creator Royalties (EIP-2981)" icon="👑">
                        <PercentBadge value={fees.royalties.default} label="Default royalty" />
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Configurable range</span>
                            <span className="font-mono text-sm font-bold text-primary">
                                {(fees.royalties.range[0] * 100).toFixed(0)}% – {(fees.royalties.range[1] * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {fees.royalties.description}
                        </p>
                    </FeeSection>

                    {/* Treasury Splits */}
                    <FeeSection title="Treasury Allocation" icon="🏦">
                        <div className="space-y-2">
                            <PercentBadge value={fees.treasurySplits.liquidity} label="Liquidity" />
                            <PercentBadge value={fees.treasurySplits.treasuryYield} label="Treasury / Yield Vault" />
                            <PercentBadge value={fees.treasurySplits.hubBuybacks} label="$HUB Buybacks" />
                        </div>
                        <p className="mt-3 text-sm italic text-muted-foreground">
                            &ldquo;{fees.treasurySplits.description}&rdquo;
                        </p>
                    </FeeSection>

                    {/* Fee Calculator */}
                    <FeeSection title="Fee Calculator" icon="🧮">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm text-muted-foreground">
                                Enter NFT price (CRO)
                            </label>
                            <input
                                type="number"
                                value={calcPrice}
                                onChange={(e) => setCalcPrice(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                placeholder="100"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {price > 0 && (
                            <motion.div
                                className="space-y-2 rounded-xl bg-muted/50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">NFT Price</span>
                                    <span className="font-mono text-foreground">{price.toFixed(2)} CRO</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">+ Buyer service fee (3%)</span>
                                    <span className="font-mono text-yellow-400">+{buyerFee.toFixed(2)} CRO</span>
                                </div>
                                <div className="border-t border-border pt-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-foreground">Total buyer pays</span>
                                        <span className="font-mono text-primary">
                                            {(price + buyerFee).toFixed(2)} CRO
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 border-t border-border pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">− Seller deduction (3%)</span>
                                        <span className="font-mono text-red-400">−{sellerFee.toFixed(2)} CRO</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">− Creator royalty (5%)</span>
                                        <span className="font-mono text-red-400">−{royalties.toFixed(2)} CRO</span>
                                    </div>
                                    <div className="mt-1 flex justify-between font-bold">
                                        <span className="text-foreground">Seller receives</span>
                                        <span className="font-mono text-green-400">
                                            {(price - sellerFee - royalties).toFixed(2)} CRO
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </FeeSection>
                </div>
            </motion.div>
        </main>
    );
}
