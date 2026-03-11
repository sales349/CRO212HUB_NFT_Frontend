'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { RarityBadge } from '@/components/mint/RarityBadge';
import { cn } from '@/lib/utils/cn';
import type { Listing } from '@/types';

interface ListingCardProps {
    listing: Listing;
    index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                href={`/market/${listing._id}`}
                className={cn(
                    'group block rounded-xl border border-border bg-background-secondary overflow-hidden',
                    'transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
                    'hover:-translate-y-1',
                )}
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                    {listing.gatewayUrl ? (
                        <Image
                            src={listing.gatewayUrl}
                            alt={listing.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                            <span className="text-4xl text-muted-foreground/50">🎨</span>
                        </div>
                    )}

                    {/* Rarity badge overlay */}
                    <div className="absolute top-3 right-3">
                        <RarityBadge rarity={listing.rarity} showScore={false} size="sm" />
                    </div>

                    {/* View count */}
                    {listing.viewCount > 0 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white/80">
                            <Eye className="h-3 w-3" />
                            {listing.viewCount}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                        {listing.name}
                    </h3>

                    <div className="mt-2 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-lg font-bold text-primary">
                                {listing.price} <span className="text-xs font-normal text-muted-foreground">{listing.currency}</span>
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Rarity</p>
                            <p className="text-sm font-medium text-foreground">{listing.rarity.score}%</p>
                        </div>
                    </div>

                    {listing.isSecondary && (
                        <div className="mt-2">
                            <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                                Secondary
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
