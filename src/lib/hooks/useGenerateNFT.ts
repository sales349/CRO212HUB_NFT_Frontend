// useGenerateNFT Hook - TanStack Query mutation for NFT generation

import { useMutation } from '@tanstack/react-query';
import { generateApi } from '@/lib/api/generate';
import { useAuth } from './useAuth';
import type { GenerateRequest, GenerateResponse } from '@/types';

export function useGenerateNFT() {
    const { authenticate } = useAuth();

    const mutation = useMutation({
        mutationFn: async (data: GenerateRequest): Promise<GenerateResponse> => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await generateApi.generate(data, token);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Generation failed');
            }

            return response.data;
        },
    });

    return {
        generate: mutation.mutate,
        generateAsync: mutation.mutateAsync,
        data: mutation.data,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}