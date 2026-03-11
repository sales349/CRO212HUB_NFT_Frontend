'use client';

import { motion } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { useFeatureFlags, useToggleFlag } from '@/lib/hooks/useFeatureFlags';

const ADMIN_WALLETS = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || '')
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

function FlagSwitch({
    name,
    enabled,
    isPending,
    onToggle,
}: {
    name: string;
    enabled: boolean;
    isPending: boolean;
    onToggle: () => void;
}) {
    const label = name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground font-mono">{name}</div>
            </div>
            <button
                onClick={onToggle}
                disabled={isPending}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${enabled ? 'bg-green-500' : 'bg-muted'
                    } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

export default function AdminFlagsPage() {
    const { address, isConnected } = useAppKitAccount();
    const { data: flags, isLoading, error } = useFeatureFlags();
    const toggleMutation = useToggleFlag();

    const isAdmin =
        isConnected &&
        address &&
        ADMIN_WALLETS.includes(address.toLowerCase());

    if (!isConnected) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-6xl">🔗</div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">Admin access requires wallet connection.</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-6xl">🚫</div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground">
                        This page is restricted to platform administrators.
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

    if (error || !flags) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-4 text-5xl">⚠️</div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">Failed to load flags</h2>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'Please try again later.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        ⚙️ Feature Flags
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Toggle platform features on or off. Changes take effect immediately.
                    </p>
                </div>

                {/* Flags Grid */}
                <div className="space-y-3">
                    {Object.entries(flags).map(([name, enabled]) => (
                        <motion.div
                            key={name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <FlagSwitch
                                name={name}
                                enabled={enabled}
                                isPending={toggleMutation.isPending}
                                onToggle={() => toggleMutation.mutate(name)}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Status */}
                {toggleMutation.isError && (
                    <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                        {toggleMutation.error instanceof Error
                            ? toggleMutation.error.message
                            : 'Failed to toggle flag'}
                    </div>
                )}
            </motion.div>
        </main>
    );
}
