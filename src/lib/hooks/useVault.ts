// useVault Hook - TanStack Query hooks for vault operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaultApi } from '@/lib/api/vault';
import { useAuth } from './useAuth';
import type {
    SavePresetRequest,
    ListPresetsQuery,
    RemixRequest,
    Preset,
} from '@/types';

export function useVaultPresets(query: ListPresetsQuery = {}) {
    const { authenticate, token } = useAuth();

    return useQuery({
        queryKey: ['vault', 'presets', query, token],
        queryFn: async () => {
            const authToken = token || (await authenticate());
            if (!authToken) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.listPresets(query, authToken);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch presets');
            }

            return response.data;
        },
        enabled: !!token,
        staleTime: 30_000,
    });
}

export function usePreset(presetId: string | null) {
    const { authenticate, token } = useAuth();

    return useQuery({
        queryKey: ['vault', 'preset', presetId],
        queryFn: async () => {
            if (!presetId) throw new Error('Preset ID required');

            const authToken = token || (await authenticate());
            if (!authToken) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.getPreset(presetId, authToken);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch preset');
            }

            return response.data.preset;
        },
        enabled: !!presetId && !!token,
    });
}

export function useSavePreset() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SavePresetRequest): Promise<Preset> => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.savePreset(data, token);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to save preset');
            }

            return response.data.preset;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault', 'presets'] });
        },
    });
}

export function useDeletePreset() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (presetId: string): Promise<void> => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.deletePreset(presetId, token);

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete preset');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault', 'presets'] });
        },
    });
}

export function useRemixPreset() {
    const { authenticate } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RemixRequest) => {
            const token = await authenticate();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.remix(data, token);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to remix preset');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault', 'presets'] });
        },
    });
}

export function useAvatarData(presetId: string | null) {
    const { authenticate, token } = useAuth();

    return useQuery({
        queryKey: ['vault', 'avatar', presetId],
        queryFn: async () => {
            if (!presetId) throw new Error('Preset ID required');

            const authToken = token || (await authenticate());
            if (!authToken) {
                throw new Error('Authentication required');
            }

            const response = await vaultApi.getAvatarData(presetId, authToken);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to fetch avatar data');
            }

            return response.data;
        },
        enabled: !!presetId && !!token,
    });
}