// Vault API - Calls to backend vault endpoints

import type {
    SavePresetRequest,
    Preset,
    ListPresetsQuery,
    ListPresetsResponse,
    RemixRequest,
    GenerateResponse,
    AvatarDataResponse,
    ApiResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

async function fetchWithAuth<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {},
): Promise<ApiResponse<T>> {
    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
        };

        // Only set Content-Type for requests with body
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.message || 'Request failed' };
        }

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}

export const vaultApi = {
    /**
     * Save a preset to vault
     */
    savePreset: async (
        data: SavePresetRequest,
        token: string,
    ): Promise<ApiResponse<{ preset: Preset }>> => {
        return fetchWithAuth('/vault/save-preset', token, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * List user's presets
     */
    listPresets: async (
        query: ListPresetsQuery,
        token: string,
    ): Promise<ApiResponse<ListPresetsResponse>> => {
        const params = new URLSearchParams();
        if (query.page) params.set('page', query.page.toString());
        if (query.limit) params.set('limit', query.limit.toString());
        if (query.sort) params.set('sort', query.sort);

        return fetchWithAuth(`/vault/presets?${params.toString()}`, token);
    },

    /**
     * Get single preset
     */
    getPreset: async (
        presetId: string,
        token: string,
    ): Promise<ApiResponse<{ preset: Preset }>> => {
        return fetchWithAuth(`/vault/presets/${presetId}`, token);
    },

    /**
     * Delete a preset
     */
    deletePreset: async (
        presetId: string,
        token: string,
    ): Promise<ApiResponse<{ message: string }>> => {
        return fetchWithAuth(`/vault/presets/${presetId}`, token, {
            method: 'DELETE',
        });
    },

    /**
     * Remix a preset with new traits
     */
    remix: async (
        data: RemixRequest,
        token: string,
    ): Promise<ApiResponse<GenerateResponse & { isRemix: boolean; sourcePresetId: string }>> => {
        return fetchWithAuth('/vault/remix', token, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get avatar data for a preset
     */
    getAvatarData: async (
        presetId: string,
        token: string,
    ): Promise<ApiResponse<AvatarDataResponse>> => {
        return fetchWithAuth(`/vault/presets/${presetId}/avatar`, token);
    },
};