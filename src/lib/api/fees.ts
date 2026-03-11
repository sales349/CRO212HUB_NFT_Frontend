// Fees API - Calls to backend fees endpoint

import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface FeeModel {
    primaryMint: {
        platformFee: number;
        description: string;
        buyerPays: string;
    };
    secondarySale: {
        buyerFee: number;
        sellerFee: number;
        totalPlatform: number;
        description: string;
    };
    royalties: {
        default: number;
        range: [number, number];
        standard: string;
        description: string;
    };
    treasurySplits: {
        liquidity: number;
        treasuryYield: number;
        hubBuybacks: number;
        description: string;
    };
}

export const feesApi = {
    /**
     * Get current fee model (public)
     */
    getFeesInfo: async (): Promise<ApiResponse<{ fees: FeeModel }>> => {
        try {
            const response = await fetch(`${API_URL}/fees/info`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to fetch fees' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },
};
