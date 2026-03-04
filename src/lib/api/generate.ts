// Generate API - Calls to backend generator endpoint

import type { GenerateRequest, GenerateResponse, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const generateApi = {
    /**
     * Generate a new NFT with specified traits
     */
    generate: async (
        data: GenerateRequest,
        token: string,
    ): Promise<ApiResponse<GenerateResponse>> => {
        try {
            const response = await fetch(`${API_URL}/api/ai/intelligent-layer/v1/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Generation failed' };
            }

            const result = await response.json();
            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Generation failed',
            };
        }
    },
};