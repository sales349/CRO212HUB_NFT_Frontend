// Projects API - All project-related endpoints

import { apiClient } from './client';
import type {
  Project,
  ProjectFormData,
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectCreateResponse,
} from '@/types';

export const projectsApi = {
  /**
   * Get all projects
   */
  list: async (): Promise<ProjectListResponse> => {
    const response = await apiClient.get<Project[]>('/api/projects');
    return {
      success: response.success,
      projects: response.data || [],
      error: response.error,
    };
  },

  /**
   * Get a single project by ID
   */
  getById: async (id: string): Promise<ProjectDetailResponse> => {
    const response = await apiClient.get<Project>(`/api/projects/${id}`);
    return {
      success: response.success,
      project: response.data,
      error: response.error,
    };
  },

  /**
   * Create a new project
   */
  create: async (data: ProjectFormData): Promise<ProjectCreateResponse> => {
    const response = await apiClient.post<Project>('/api/projects', data);
    return {
      success: response.success,
      project: response.data,
      error: response.error,
    };
  },

  /**
   * Update an existing project
   */
  update: async (id: string, data: Partial<ProjectFormData>): Promise<ProjectDetailResponse> => {
    const response = await apiClient.put<Project>(`/api/projects/${id}`, data);
    return {
      success: response.success,
      project: response.data,
      error: response.error,
    };
  },

  /**
   * Delete a project
   */
  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    const response = await apiClient.delete(`/api/projects/${id}`);
    return {
      success: response.success,
      error: response.error,
    };
  },
};
