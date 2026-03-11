'use client';

// useContractEvents — Watch on-chain events for optimistic UI updates

import { useWatchContractEvent } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/contracts/marketplace-contract';
import { LAUNCHPAD_COLLECTION_ABI, NFT_CONTRACT_ADDRESS } from '@/lib/contracts/nft-contract';
import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';

/**
 * Watches Sale events on CRO212Marketplace to invalidate listing queries.
 * When a sale happens, the listing should update to "Sold" in the UI.
 */
export function useWatchSaleEvents() {
    const queryClient = useTanstackQueryClient();

    useWatchContractEvent({
        address: MARKETPLACE_CONTRACT_ADDRESS || undefined,
        abi: MARKETPLACE_ABI,
        eventName: 'Sale',
        enabled: !!MARKETPLACE_CONTRACT_ADDRESS,
        onLogs() {
            // Invalidate listing queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            queryClient.invalidateQueries({ queryKey: ['marketStats'] });
        },
    });
}

/**
 * Watches Listed events for new marketplace listings.
 */
export function useWatchListedEvents() {
    const queryClient = useTanstackQueryClient();

    useWatchContractEvent({
        address: MARKETPLACE_CONTRACT_ADDRESS || undefined,
        abi: MARKETPLACE_ABI,
        eventName: 'Listed',
        enabled: !!MARKETPLACE_CONTRACT_ADDRESS,
        onLogs() {
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            queryClient.invalidateQueries({ queryKey: ['marketStats'] });
        },
    });
}

/**
 * Watches Cancelled events to remove cancelled listings from UI.
 */
export function useWatchCancelledEvents() {
    const queryClient = useTanstackQueryClient();

    useWatchContractEvent({
        address: MARKETPLACE_CONTRACT_ADDRESS || undefined,
        abi: MARKETPLACE_ABI,
        eventName: 'Cancelled',
        enabled: !!MARKETPLACE_CONTRACT_ADDRESS,
        onLogs() {
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            queryClient.invalidateQueries({ queryKey: ['marketStats'] });
        },
    });
}

/**
 * Watches PublicMint events on LaunchpadCollection to update supply counter.
 */
export function useWatchMintEvents() {
    const queryClient = useTanstackQueryClient();

    useWatchContractEvent({
        address: NFT_CONTRACT_ADDRESS || undefined,
        abi: LAUNCHPAD_COLLECTION_ABI,
        eventName: 'PublicMint',
        enabled: !!NFT_CONTRACT_ADDRESS,
        onLogs() {
            // Invalidate totalSupply read queries
            queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'totalSupply' }] });
        },
    });
}

/**
 * Combined hook — use on marketplace pages to watch all relevant events.
 */
export function useMarketplaceEvents() {
    useWatchSaleEvents();
    useWatchListedEvents();
    useWatchCancelledEvents();
}
