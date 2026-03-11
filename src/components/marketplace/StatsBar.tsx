'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Store, DollarSign, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MarketStats } from '@/types';

interface StatsBarProps {
    stats: MarketStats | undefined;
    isLoading: boolean;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    index: number;
}

function StatCard({ icon, label, value, subValue, index }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-border bg-background-secondary p-4 flex items-center gap-3"
        >
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                {icon}
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
                {subValue && (
                    <p className="text-xs text-muted-foreground">{subValue}</p>
                )}
            </div>
        </motion.div>
    );
}

export function StatsBar({ stats, isLoading }: StatsBarProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const items: Omit<StatCardProps, 'index'>[] = [
        {
            icon: <Store className="h-5 w-5" />,
            label: 'Active Listings',
            value: stats.activeListings.toLocaleString(),
            subValue: `${stats.totalListings.toLocaleString()} total`,
        },
        {
            icon: <DollarSign className="h-5 w-5" />,
            label: 'Floor Price',
            value: stats.floorPrice ? `${stats.floorPrice} CRO` : '—',
        },
        {
            icon: <BarChart3 className="h-5 w-5" />,
            label: 'Avg Price',
            value: stats.averagePrice ? `${stats.averagePrice} CRO` : '—',
        },
        {
            icon: <TrendingUp className="h-5 w-5" />,
            label: 'Volume',
            value: stats.totalVolume > 0 ? `${stats.totalVolume.toLocaleString()} CRO` : '—',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
                <StatCard key={item.label} {...item} index={i} />
            ))}
        </div>
    );
}
