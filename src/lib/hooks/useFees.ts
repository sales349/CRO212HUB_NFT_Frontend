'use client';

// useFees Hook - TanStack Query hook for fee model

import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/lib/api/fees';

export function useFees() {
    return useQuery({
        queryKey: ['fees', 'info'],
        queryFn: async () => {
            const response = await feesApi.getFeesInfo();

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch fees');
            }

            return response.data.fees;
        },
        staleTime: 5 * 60_000, // 5 minutes — fee model rarely changes
    });
}
