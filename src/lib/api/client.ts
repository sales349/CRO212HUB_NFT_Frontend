// API Client - Base HTTP client with TypeScript support

import { ApiError, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJSON ? await response.json() : await response.text();
      const error: ApiError = {
        message: typeof errorData === 'string' ? errorData : errorData.error || 'Request failed',
        code: errorData.code,
        status: response.status,
      };
      throw error;
    }

    if (isJSON) {
      return response.json() as Promise<T>;
    }
    return response.text() as unknown as T;
  }

  async request<T = unknown>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await this.handleResponse<ApiResponse<T>>(response);
      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return {
          success: false,
          error: (error as ApiError).message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        ...options,
        headers: {
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...options?.headers,
        },
      });

      const data = await this.handleResponse<ApiResponse<T>>(response);
      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return {
          success: false,
          error: (error as ApiError).message,
        };
      }
      return {
        success: false,
        error: 'Upload failed',
      };
    }
  }
}

export const apiClient = new APIClient(API_URL);
