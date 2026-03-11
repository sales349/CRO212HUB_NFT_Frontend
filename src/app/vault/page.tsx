'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, SortAsc } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { PresetGrid } from '@/components/vault/PresetGrid';
import { ListingModal } from '@/components/vault/ListingModal';
import { useVaultPresets, useDeletePreset, useCreateListing, useAuth } from '@/lib/hooks';
import { cn } from '@/lib/utils/cn';
import type { ListPresetsQuery, Preset } from '@/types/generator';
import { NFT_CONTRACT_ADDRESS } from '@/lib/contracts/nft-contract';

type SortOption = 'newest' | 'oldest' | 'rarity';

export default function VaultPage() {
    const router = useRouter();
    const { isConnected } = useAppKitAccount();
    const { authenticate, token } = useAuth();
    const [sort, setSort] = useState<SortOption>('newest');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sellingPreset, setSellingPreset] = useState<Preset | null>(null);

    const query: ListPresetsQuery = { sort, limit: 50 };
    const { data, isLoading, error, refetch } = useVaultPresets(query);
    const deletePreset = useDeletePreset();
    const createListing = useCreateListing();

    // Auto-authenticate when page loads
    useEffect(() => {
        if (isConnected && !token) {
            authenticate();
        }
    }, [isConnected, token, authenticate]);

    const handleDelete = async (presetId: string) => {
        if (!confirm('Are you sure you want to delete this preset?')) return;

        setDeletingId(presetId);

        deletePreset.mutate(presetId, {
            onSuccess: () => {
                toast.success('Preset deleted');
                setDeletingId(null);
            },
            onError: (err) => {
                toast.error(err instanceof Error ? err.message : 'Failed to delete');
                setDeletingId(null);
            },
        });
    };

    const handleSell = (preset: Preset) => {
        setSellingPreset(preset);
    };

    const handleConfirmListing = (price: number) => {
        if (!sellingPreset) return;

        createListing.mutate(
            {
                tokenId: sellingPreset._id,
                price,
                name: sellingPreset.name,
                description: sellingPreset.prompt,
                traits: sellingPreset.traits,
                rarity: sellingPreset.rarity,
                imageUrl: sellingPreset.imageUrl,
                metadataUrl: sellingPreset.metadataUrl,
                gatewayUrl: sellingPreset.gatewayUrl,
                collectionAddress: NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
                chainId: 338,
            },
            {
                onSuccess: () => {
                    toast.success('Listed on marketplace!');
                    setSellingPreset(null);
                    router.push('/marketplace');
                },
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : 'Failed to list');
                },
            },
        );
    };

    if (!isConnected) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-foreground">Your Vault</h1>
                <p className="mt-4 text-muted-foreground">
                    Connect your wallet to view your saved presets.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Your Vault</h1>
                    <p className="mt-2 text-muted-foreground">
                        {data?.total ?? 0} saved presets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background-secondary px-3 py-2">
                        <SortAsc className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="bg-transparent text-sm text-foreground outline-none"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="rarity">Rarity</option>
                        </select>
                    </div>

                    {/* Create New */}
                    <Link
                        href="/mint"
                        className={cn(
                            'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
                            'transition-opacity hover:opacity-90',
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Create New
                    </Link>
                </div>
            </motion.div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error instanceof Error ? error.message : 'Failed to load presets'}
                    <button onClick={() => refetch()} className="ml-2 underline">
                        Retry
                    </button>
                </div>
            )}

            <PresetGrid
                presets={data?.presets ?? []}
                isLoading={isLoading}
                onDelete={handleDelete}
                onSell={handleSell}
                deletingId={deletingId}
            />

            {/* Listing Modal */}
            {sellingPreset && (
                <ListingModal
                    preset={sellingPreset}
                    isOpen={!!sellingPreset}
                    onClose={() => setSellingPreset(null)}
                    onConfirm={handleConfirmListing}
                    isSubmitting={createListing.isPending}
                />
            )}
        </div>
    );
}