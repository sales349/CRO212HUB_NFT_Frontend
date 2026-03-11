'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import { useListings, useMarketStats } from '@/lib/hooks';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { StatsBar } from '@/components/marketplace/StatsBar';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ListingsQuery } from '@/types';

export default function MarketplacePage() {
    const [query, setQuery] = useState<ListingsQuery>({
        sort: 'newest',
        status: 'active',
        limit: 20,
    });

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
    } = useListings(query);

    const { data: stats, isLoading: statsLoading } = useMarketStats();

    // Infinite scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) observerRef.current.disconnect();
            if (!node) return;

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }, { threshold: 0.1 });

            observerRef.current.observe(node);
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage],
    );

    const allListings = data?.pages.flatMap((page) => page.listings) ?? [];
    const totalCount = data?.pages[0]?.total ?? 0;

    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <Store className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
                </div>
                <p className="text-muted-foreground">
                    Browse, filter, and discover unique CRO212HUB NFTs
                </p>
            </motion.div>

            {/* Stats */}
            <div className="mb-8">
                <StatsBar stats={stats} isLoading={statsLoading} />
            </div>

            {/* Filters */}
            <div className="mb-8">
                <FilterBar query={query} onChange={setQuery} />
            </div>

            {/* Results count */}
            {!isLoading && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 text-sm text-muted-foreground"
                >
                    {totalCount.toLocaleString()} listing{totalCount !== 1 ? 's' : ''} found
                </motion.p>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error instanceof Error ? error.message : 'Failed to load listings'}
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                    ))}
                </div>
            ) : allListings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <Store className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h2 className="text-xl font-semibold text-foreground">No listings found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Try adjusting your filters or check back later.
                    </p>
                </motion.div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {allListings.map((listing, index) => (
                            <ListingCard key={listing._id} listing={listing} index={index} />
                        ))}
                    </div>

                    {/* Infinite scroll trigger */}
                    <div ref={loadMoreRef} className="mt-8 flex justify-center">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Loading more...
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
