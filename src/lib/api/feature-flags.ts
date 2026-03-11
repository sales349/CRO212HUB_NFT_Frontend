// Feature Flags API - Calls to backend feature-flags endpoints

import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export type FeatureFlags = Record<string, boolean>;

export const featureFlagsApi = {
    /**
     * Get all feature flags (public)
     */
    getFlags: async (): Promise<ApiResponse<{ flags: FeatureFlags }>> => {
        try {
            const response = await fetch(`${API_URL}/feature-flags`);
            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to fetch flags' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },

    /**
     * Toggle a feature flag (admin only, auth required)
     */
    toggleFlag: async (
        name: string,
        token: string,
    ): Promise<ApiResponse<{ flag: { name: string; enabled: boolean } }>> => {
        try {
            const response = await fetch(`${API_URL}/feature-flags/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            const result = await response.json();
            if (!response.ok) {
                return { success: false, error: result.message || 'Failed to toggle flag' };
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
        }
    },
};
