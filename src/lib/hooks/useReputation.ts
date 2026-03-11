'use client';

// useReputation Hook - TanStack Query hook for wallet reputation

import { useQuery } from '@tanstack/react-query';
import { reputationApi } from '@/lib/api/reputation';

export function useReputation(address: string | undefined) {
    return useQuery({
        queryKey: ['reputation', address],
        queryFn: async () => {
            if (!address) throw new Error('Address required');

            const response = await reputationApi.getReputation(address);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch reputation');
            }

            return response.data.reputation;
        },
        enabled: !!address,
        staleTime: 60_000, // 1 minute
    });
}
