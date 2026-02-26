'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { RarityBadge } from './RarityBadge';
import { RarityBreakdown } from './RarityBreakdown';
import type { GenerateResponse } from '@/types/generator';

interface NFTPreviewProps {
    data: GenerateResponse | null;
    isLoading?: boolean;
    onSaveToVault?: () => void;
    onMint?: () => void;
    isSaving?: boolean;
}

export function NFTPreview({
    data,
    isLoading,
    onSaveToVault,
    onMint,
    isSaving,
}: NFTPreviewProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-background-secondary p-6">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="mt-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-background-secondary/50 p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                    Select traits and generate to preview your NFT
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-background-secondary overflow-hidden"
        >
            {/* Image */}
            <div className="relative aspect-square bg-background">
                <Image
                    src={data.gatewayUrl}
                    alt={data.metadata.name}
                    fill
                    className="object-cover"
                    unoptimized
                />
                <div className="absolute top-3 right-3">
                    <RarityBadge rarity={data.rarity} size="lg" />
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{data.metadata.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {data.metadata.description}
                    </p>
                </div>

                {/* Rarity Breakdown */}
                <RarityBreakdown rarity={data.rarity} />

                {/* IPFS Links */}
                <div className="flex gap-2 text-xs">
                    <a
                        href={data.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Image
                    </a>
                    <a
                        href={`https://gateway.pinata.cloud/ipfs/${data.metadataUrl.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Metadata
                    </a>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onSaveToVault}
                        disabled={isSaving}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium',
                            'transition-colors hover:bg-muted disabled:opacity-50',
                        )}
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                    </button>
                    <button
                        onClick={onMint}
                        className={cn(
                            'flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground',
                            'transition-opacity hover:opacity-90',
                        )}
                    >
                        Mint NFT
                    </button>
                </div>

                {/* Fee Note */}
                <p className="text-xs text-center text-muted-foreground">
                    Platform takes 2% on primary mints (deducted from creator proceeds)
                </p>
            </div>
        </motion.div>
    );
}