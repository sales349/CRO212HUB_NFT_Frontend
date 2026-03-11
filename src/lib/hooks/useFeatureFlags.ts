'use client';

// useFeatureFlags Hook - TanStack Query hooks for feature flags

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureFlagsApi } from '@/lib/api/feature-flags';
import { useAuth } from './useAuth';

/**
 * Get all feature flags — loaded on app startup, cached aggressively
 */
export function useFeatureFlags() {
    return useQuery({
        queryKey: ['feature-flags'],
        queryFn: async () => {
            const response = await featureFlagsApi.getFlags();

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch flags');
            }

            return response.data.flags;
        },
        staleTime: 60_000, // 1 minute
        refetchOnWindowFocus: true,
    });
}

/**
 * Check if a specific feature flag is enabled
 */
export function useFeatureFlag(name: string): boolean {
    const { data: flags } = useFeatureFlags();
    return flags?.[name] ?? false;
}

/**
 * Toggle a feature flag (admin only)
 */
export function useToggleFlag() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await featureFlagsApi.toggleFlag(name, token);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to toggle flag');
            }

            return response.data.flag;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
        },
    });
}
