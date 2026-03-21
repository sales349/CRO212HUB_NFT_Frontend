'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ShoppingCart,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Eye,
    Clock,
    User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useListing } from '@/lib/hooks';
import { RarityBadge } from '@/components/mint/RarityBadge';
import { BuyModal } from '@/components/marketplace/BuyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { RARITY_COLORS } from '@/types/generator';

function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface ExpandableSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function ExpandableSection({ title, defaultOpen = false, children }: ExpandableSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-xl border border-border bg-background-secondary overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
                {title}
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-border px-4 py-3"
                >
                    {children}
                </motion.div>
            )}
        </div>
    );
}

export default function ListingDetailPage() {
    const params = useParams();
    const nftId = params.nftId as string;
    const { data: listing, isLoading, error } = useListing(nftId);
    const [buyModalOpen, setBuyModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10">
                <Skeleton className="h-6 w-32 mb-8" />
                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    <Skeleton className="aspect-square rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Listing Not Found</h1>
                <p className="mt-4 text-muted-foreground">
                    This listing may have been removed or doesn&apos;t exist.
                </p>
                <Link
                    href="/marketplace"
                    className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Marketplace
                </Link>
            </div>
        );
    }
    const handleBuy = () => {
        setBuyModalOpen(true);
    };

    const traitEntries = Object.entries(listing.traits);

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            {/* Back link */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link
                    href="/marketplace"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Marketplace
                </Link>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
                        {listing.gatewayUrl ? (
                            <Image
                                src={listing.gatewayUrl}
                                alt={listing.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-muted">
                                <span className="text-6xl text-muted-foreground/50">🎨</span>
                            </div>
                        )}

                        {/* Status badge */}
                        {listing.status !== 'active' && (
                            <div className={cn(
                                'absolute top-4 left-4 rounded-full px-3 py-1 text-sm font-semibold',
                                listing.status === 'sold' && 'bg-green-500/90 text-white',
                                listing.status === 'cancelled' && 'bg-red-500/90 text-white',
                            )}>
                                {listing.status === 'sold' ? 'Sold' : 'Cancelled'}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Title + Rarity */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{listing.name}</h1>
                        <div className="mt-2 flex items-center gap-3">
                            <RarityBadge rarity={listing.rarity} size="md" />
                        </div>
                    </div>

                    {/* Price + Buy */}
                    <div className="rounded-xl border border-border bg-background-secondary p-5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {listing.isSecondary ? 'Secondary Sale Price' : 'Listing Price'}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                            {listing.price} <span className="text-lg font-normal text-muted-foreground">{listing.currency}</span>
                        </p>

                        {listing.isSecondary && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                6% fee applies (3% buyer + 3% seller)
                            </p>
                        )}

                        {listing.status === 'active' && (
                            <button
                                onClick={handleBuy}
                                className={cn(
                                    'mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground',
                                    'transition-all hover:opacity-90 glow-hover',
                                )}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Buy Now
                            </button>
                        )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Seller: <span className="text-foreground font-mono">{formatAddress(listing.seller)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Listed: {formatDate(listing.createdAt)}
                        </div>
                        {listing.viewCount > 0 && (
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {listing.viewCount} views
                            </div>
                        )}
                    </div>

                    {/* Expandable Sections */}
                    <div className="space-y-3">
                        {/* Traits */}
                        <ExpandableSection title={`Traits (${traitEntries.length})`} defaultOpen>
                            <div className="grid grid-cols-2 gap-3">
                                {traitEntries.map(([category, value]) => (
                                    <div
                                        key={category}
                                        className="rounded-lg border border-border bg-background p-3"
                                    >
                                        <p className="text-xs text-muted-foreground uppercase">{category}</p>
                                        <p className="text-sm font-medium text-foreground capitalize">
                                            {String(value).replace(/_/g, ' ')}
                                        </p>
                                        {listing.rarity.breakdown[category] !== undefined && (
                                            <div className="mt-1.5">
                                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{ width: `${listing.rarity.breakdown[category]}%` }}
                                                    />
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground text-right">
                                                    {listing.rarity.breakdown[category]}% rare
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ExpandableSection>

                        {/* Rarity */}
                        <ExpandableSection title="Rarity Details">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Overall Score</span>
                                    <span className="text-lg font-bold" style={{ color: RARITY_COLORS[listing.rarity.rank] }}>
                                        {listing.rarity.score}%
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${listing.rarity.score}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: RARITY_COLORS[listing.rarity.rank] }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Rank</span>
                                    <RarityBadge rarity={listing.rarity} size="md" />
                                </div>
                            </div>
                        </ExpandableSection>

                        {/* Metadata / Links */}
                        <ExpandableSection title="Metadata & Links">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Token ID</span>
                                    <span className="font-mono text-foreground">{listing.tokenId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Chain</span>
                                    <span className="text-foreground">Cronos ({listing.chainId})</span>
                                </div>
                                {listing.metadataUrl && (
                                    <a
                                        href={listing.metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        View Metadata on IPFS
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Contract</span>
                                    <span className="font-mono text-xs text-foreground">
                                        {formatAddress(listing.collectionAddress)}
                                    </span>
                                </div>
                            </div>
                        </ExpandableSection>

                        {/* Activity / History placeholder */}
                        <ExpandableSection title="Activity">
                            <div className="flex flex-col items-center py-6 text-center">
                                <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    On-chain history coming in Week 5
                                </p>
                            </div>
                        </ExpandableSection>
                    </div>
                </motion.div>
            </div>

            {/* Buy Modal */}
            {listing.onChainListingId !== undefined && (
                <BuyModal
                    isOpen={buyModalOpen}
                    onClose={() => setBuyModalOpen(false)}
                    listingId={listing.onChainListingId ?? 0}
                    nftName={listing.name}
                    nftImage={listing.gatewayUrl}
                    price={String(listing.price)}
                />
            )}
        </div>
    );
}
