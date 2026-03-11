'use client';

import { motion } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { useReputation } from '@/lib/hooks/useReputation';

function getRankBadge(score: number): { label: string; color: string; emoji: string } {
    if (score >= 80) return { label: 'Diamond', color: 'text-cyan-400', emoji: '💎' };
    if (score >= 60) return { label: 'Platinum', color: 'text-purple-400', emoji: '🏆' };
    if (score >= 40) return { label: 'Gold', color: 'text-yellow-400', emoji: '🥇' };
    if (score >= 20) return { label: 'Silver', color: 'text-gray-300', emoji: '🥈' };
    return { label: 'Bronze', color: 'text-orange-400', emoji: '🥉' };
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="mb-1 text-2xl">{icon}</div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

export default function ProfilePage() {
    const { address, isConnected } = useAppKitAccount();
    const { data: reputation, isLoading, error } = useReputation(address);

    if (!isConnected) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-6xl">🔗</div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                        Connect your wallet to view your reputation and activity.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !reputation) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-5xl">⚠️</div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">Failed to load reputation</h2>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'Please try again later.'}
                    </p>
                </div>
            </div>
        );
    }

    const rank = getRankBadge(reputation.reputationScore);

    return (
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Your Profile
                    </h1>
                    <p className="mt-2 font-mono text-sm text-muted-foreground">
                        {address}
                    </p>
                </div>

                {/* Reputation Score */}
                <motion.div
                    className="mb-8 rounded-2xl border border-border bg-card p-6 text-center"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="mb-2 text-4xl">{rank.emoji}</div>
                    <div className={`mb-1 text-sm font-semibold ${rank.color}`}>
                        {rank.label} Rank
                    </div>
                    <div className="mb-4 text-5xl font-bold text-foreground">
                        {reputation.reputationScore}
                    </div>

                    {/* Score bar */}
                    <div className="mx-auto max-w-xs">
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(reputation.reputationScore, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>100</span>
                        </div>
                    </div>
                </motion.div>

                {/* Activity Stats */}
                <motion.div
                    className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <StatCard icon="🎨" label="Mints" value={reputation.totalMints} />
                    <StatCard icon="💰" label="Sales" value={reputation.totalSales} />
                    <StatCard icon="🛒" label="Purchases" value={reputation.totalPurchases} />
                    <StatCard icon="📋" label="Listings" value={reputation.totalListings} />
                    <StatCard
                        icon="📊"
                        label="Volume (CRO)"
                        value={reputation.totalVolume.toFixed(2)}
                    />
                </motion.div>

                {/* Staking Placeholder */}
                <motion.div
                    className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="mb-3 text-4xl">🔒</div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                        Staking — Coming Soon
                    </h3>
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        Stake your NFTs to earn rewards and boost your reputation score.
                        This feature is under development and will be available in a future update.
                    </p>
                </motion.div>
            </motion.div>
        </main>
    );
}
