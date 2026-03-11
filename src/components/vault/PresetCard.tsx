'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Wand2, User, Store } from 'lucide-react';
import { RarityBadge } from '@/components/mint/RarityBadge';
import { formatRelativeTime } from '@/lib/utils/formatting';
import type { Preset } from '@/types/generator';

interface PresetCardProps {
    preset: Preset;
    onDelete?: (id: string) => void;
    onSell?: (preset: Preset) => void;
    isDeleting?: boolean;
}

export function PresetCard({ preset, onDelete, onSell, isDeleting }: PresetCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-background-secondary transition-all hover:border-primary/30"
        >
            {/* Image */}
            <div className="relative aspect-square bg-background">
                {preset.gatewayUrl ? (
                    <Image
                        src={preset.gatewayUrl}
                        alt={preset.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-4xl">🎨</span>
                    </div>
                )}

                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                    <RarityBadge rarity={preset.rarity} showScore={false} size="sm" />
                </div>

                {/* Remix indicator */}
                {preset.isRemix && (
                    <div className="absolute top-2 left-2 rounded-full bg-secondary/80 px-2 py-0.5 text-xs text-white">
                        Remix
                    </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {onSell && (
                        <button
                            onClick={() => onSell(preset)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-transform hover:scale-110"
                            title="Sell on Marketplace"
                        >
                            <Store className="h-4 w-4" />
                        </button>
                    )}
                    <Link
                        href={`/remix?preset=${preset._id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
                    >
                        <Wand2 className="h-4 w-4" />
                    </Link>
                    <Link
                        href={`/avatar-builder?preset=${preset._id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white transition-transform hover:scale-110"
                    >
                        <User className="h-4 w-4" />
                    </Link>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(preset._id)}
                            disabled={isDeleting}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="truncate text-sm font-semibold text-foreground">
                    {preset.name}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                    {preset.prompt}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Score: {preset.rarity.score.toFixed(1)}</span>
                    <span>{formatRelativeTime(preset.createdAt)}</span>
                </div>
            </div>
        </motion.div>
    );
}