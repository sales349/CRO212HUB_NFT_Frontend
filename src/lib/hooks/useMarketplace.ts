// useMarketplace Hook - TanStack Query hooks for marketplace operations

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '@/lib/api/marketplace';
import { useAuth } from './useAuth';
import type {
    CreateListingRequest,
    ListingsQuery,
    Listing,
} from '@/types';

export function useListings(query: ListingsQuery = {}) {
    return useInfiniteQuery({
        queryKey: ['marketplace', 'listings', query],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await marketplaceApi.getListings({
                ...query,
                page: pageParam,
                limit: query.limit ?? 20,
            });

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch listings');
            }

            return response.data;
        },
        getNextPageParam: (lastPage) => {
            const totalPages = Math.ceil(lastPage.total / lastPage.limit);
            return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 15_000,
    });
}

export function useListing(listingId: string | null) {
    return useQuery({
        queryKey: ['marketplace', 'listing', listingId],
        queryFn: async () => {
            if (!listingId) throw new Error('Listing ID required');

            const response = await marketplaceApi.getListing(listingId);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch listing');
            }

            return response.data.listing;
        },
        enabled: !!listingId,
    });
}

export function useMarketStats() {
    return useQuery({
        queryKey: ['marketplace', 'stats'],
        queryFn: async () => {
            const response = await marketplaceApi.getMarketStats();

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch stats');
            }

            return response.data.stats;
        },
        staleTime: 30_000,
    });
}

export function useCreateListing() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateListingRequest): Promise<Listing> => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await marketplaceApi.createListing(data, token);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to create listing');
            }

            return response.data.listing;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace'] });
        },
    });
}

export function useCancelListing() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (listingId: string): Promise<void> => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await marketplaceApi.cancelListing(listingId, token);

            if (!response.success) {
                throw new Error(response.error || 'Failed to cancel listing');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace'] });
        },
    });
}
