// Marketplace API - Calls to backend marketplace endpoints

import type {
    CreateListingRequest,
    Listing,
    ListingsQuery,
    ListingsResponse,
    MarketStats,
    ApiResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const marketplaceApi = {
    /**
     * Create a marketplace listing (auth required)
     */
    createListing: async (
        data: CreateListingRequest,
        token: string,
    ): Promise<ApiResponse<{ listing: Listing }>> => {
        try {
            const response = await fetch(`${API_URL}/market/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to create listing' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },

    /**
     * List marketplace listings with filters (public)
     */
    getListings: async (query: ListingsQuery = {}): Promise<ApiResponse<ListingsResponse>> => {
        try {
            const params = new URLSearchParams();
            if (query.page) params.set('page', query.page.toString());
            if (query.limit) params.set('limit', query.limit.toString());
            if (query.sort) params.set('sort', query.sort);
            if (query.status) params.set('status', query.status);
            if (query.minPrice !== undefined) params.set('minPrice', query.minPrice.toString());
            if (query.maxPrice !== undefined) params.set('maxPrice', query.maxPrice.toString());
            if (query.rarityRank) params.set('rarityRank', query.rarityRank);
            if (query.seller) params.set('seller', query.seller);
            if (query.search) params.set('search', query.search);

            const response = await fetch(`${API_URL}/market/listings?${params.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to fetch listings' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },

    /**
     * Get single listing (public)
     */
    getListing: async (listingId: string): Promise<ApiResponse<{ listing: Listing }>> => {
        try {
            const response = await fetch(`${API_URL}/market/listings/${listingId}`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Listing not found' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },

    /**
     * Cancel a listing (auth required, owner only)
     */
    cancelListing: async (
        listingId: string,
        token: string,
    ): Promise<ApiResponse<{ message: string }>> => {
        try {
            const response = await fetch(`${API_URL}/market/listings/${listingId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to cancel listing' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },

    /**
     * Get marketplace stats (public)
     */
    getMarketStats: async (): Promise<ApiResponse<{ stats: MarketStats }>> => {
        try {
            const response = await fetch(`${API_URL}/market/stats`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to fetch stats' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },
};
