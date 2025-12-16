// Traits API - All trait-related endpoints

import { apiClient } from './client';
import type { Trait, TraitListResponse, TraitUploadResponse, LayerType } from '@/types';

export const traitsApi = {
  /**
   * Get all traits for a project
   */
  list: async (projectId: string): Promise<TraitListResponse> => {
    const response = await apiClient.get<Trait[]>(`/api/projects/${projectId}/traits`);
    return {
      success: response.success,
      traits: response.data || [],
      error: response.error,
    };
  },

  /**
   * Upload traits for a specific layer
   */
  upload: async (
    projectId: string,
    layerType: LayerType,
    files: File[]
  ): Promise<TraitUploadResponse> => {
    const formData = new FormData();
    formData.append('layerType', layerType);

    files.forEach((file) => {
      formData.append('traits', file);
    });

    const response = await apiClient.upload<{
      traits: Trait[];
      uploaded_count: number;
    }>(`/api/projects/${projectId}/traits`, formData);

    return {
      success: response.success,
      traits: response.data?.traits,
      uploaded_count: response.data?.uploaded_count,
      error: response.error,
    };
  },

  /**
   * Delete a trait
   */
  delete: async (
    projectId: string,
    traitId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await apiClient.delete(`/api/projects/${projectId}/traits/${traitId}`);
    return {
      success: response.success,
      error: response.error,
    };
  },
};
