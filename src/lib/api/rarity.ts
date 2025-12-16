// Rarity API - Rarity calculation and statistics endpoints

import { apiClient } from './client';
import type { RarityCalculateResponse, RarityStatsResponse, RarityStatistics } from '@/types';

export const rarityApi = {
  /**
   * Calculate rarity scores for all tokens in a project
   */
  calculate: async (projectId: string): Promise<RarityCalculateResponse> => {
    const response = await apiClient.post<RarityStatistics>(`/api/rarity/${projectId}/calculate`);

    return {
      success: response.success,
      statistics: response.data,
      error: response.error,
    };
  },

  /**
   * Get rarity statistics for a project
   */
  getStatistics: async (projectId: string): Promise<RarityStatsResponse> => {
    const response = await apiClient.get<{
      statistics: RarityStatistics;
    }>(`/api/rarity/${projectId}/statistics`);

    return {
      success: response.success,
      statistics: response.data?.statistics,
      error: response.error,
    };
  },

  /**
   * Export rarity data as CSV
   * Returns the CSV file path for download
   */
  exportCSV: (projectId: string): string => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${API_URL}/api/rarity/${projectId}/export-csv`;
  },

  /**
   * Get top rarest tokens
   */
  getTopRarest: async (projectId: string, limit: number = 10) => {
    const response = await apiClient.get(`/api/rarity/${projectId}/top-rarest?limit=${limit}`);
    return response;
  },

  /**
   * Get trait breakdown statistics
   */
  getTraitBreakdown: async (projectId: string) => {
    const response = await apiClient.get(`/api/rarity/${projectId}/trait-breakdown`);
    return response;
  },
};
