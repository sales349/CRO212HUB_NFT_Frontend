// Generation API - NFT generation endpoints

import { apiClient } from './client';
import type {
  GenerationRequest,
  GenerationResponse,
  GenerationStatus,
  TokenListResponse,
  TokenRarity,
} from '@/types';

export const generationApi = {
  /**
   * Start NFT generation for a project
   */
  generate: async (projectId: string, params: GenerationRequest): Promise<GenerationResponse> => {
    const response = await apiClient.post<{
      message: string;
      tokenCount: number;
    }>(`/api/generate/${projectId}`, params);

    return {
      success: response.success,
      message: response.data?.message,
      tokenCount: response.data?.tokenCount,
      error: response.error,
    };
  },

  /**
   * Get generation status for a project
   */
  getStatus: async (projectId: string): Promise<GenerationResponse> => {
    const response = await apiClient.get<{
      project: GenerationStatus;
    }>(`/api/generate/${projectId}/status`);

    return {
      success: response.success,
      status: response.data?.project,
      error: response.error,
    };
  },

  /**
   * Get generated tokens for a project
   */
  getTokens: async (
    projectId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<TokenListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/api/generate/${projectId}/tokens${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get<{
      tokens: TokenRarity[];
      total: number;
    }>(endpoint);

    return {
      success: response.success,
      tokens: response.data?.tokens || [],
      total: response.data?.total || 0,
      error: response.error,
    };
  },

  /**
   * Download rarity configuration CSV template
   */
  downloadRarityTemplate: async (projectId: string): Promise<void> => {
    const url = `${apiClient['baseURL']}/api/generate/${projectId}/rarity-template`;
    window.open(url, '_blank');
  },

  /**
   * Save rarity configuration
   */
  saveRarityConfig: async (
    projectId: string,
    rarityConfig: Record<string, Record<string, number>>
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await apiClient.post<{
      message: string;
      data: { rarity_config: Record<string, Record<string, number>> };
    }>(`/api/generate/${projectId}/rarity-config`, { rarityConfig });

    return {
      success: response.success,
      message: response.data?.message,
      error: response.error,
    };
  },

  /**
   * Get current rarity configuration
   */
  getRarityConfig: async (
    projectId: string
  ): Promise<{
    success: boolean;
    data?: {
      project_id: string;
      project_name: string;
      rarity_config: Record<string, Record<string, number>> | null;
    };
    error?: string;
  }> => {
    const response = await apiClient.get<{
      project_id: string;
      project_name: string;
      rarity_config: Record<string, Record<string, number>> | null;
    }>(`/api/generate/${projectId}/rarity-config`);

    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  },
};
