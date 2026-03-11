'use client';

import { AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { PresetCard } from './PresetCard';
import type { Preset } from '@/types/generator';

interface PresetGridProps {
    presets: Preset[];
    isLoading?: boolean;
    onDelete?: (id: string) => void;
    onSell?: (preset: Preset) => void;
    deletingId?: string | null;
}

export function PresetGrid({ presets, isLoading, onDelete, onSell, deletingId }: PresetGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background-secondary">
                        <Skeleton className="aspect-square w-full rounded-t-xl" />
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (presets.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-background-secondary/50 p-12 text-center">
                <span className="text-4xl">📦</span>
                <p className="mt-4 text-muted-foreground">
                    Your vault is empty. Generate some NFTs to save here!
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
                {presets.map((preset) => (
                    <PresetCard
                        key={preset._id}
                        preset={preset}
                        onDelete={onDelete}
                        onSell={onSell}
                        isDeleting={deletingId === preset._id}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}