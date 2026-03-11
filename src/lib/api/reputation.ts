// Reputation API - Calls to backend reputation endpoint

import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ReputationData {
    walletAddress: string;
    reputationScore: number;
    totalMints: number;
    totalSales: number;
    totalPurchases: number;
    totalListings: number;
    totalVolume: number;
    lastActivity: string | null;
}

export const reputationApi = {
    /**
     * Get wallet reputation (public)
     */
    getReputation: async (address: string): Promise<ApiResponse<{ reputation: ReputationData }>> => {
        try {
            const response = await fetch(`${API_URL}/wallet/reputation?address=${address}`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to fetch reputation' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },
};
