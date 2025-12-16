// API Types and Interfaces

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface GenerationStatus {
  id: string;
  name: string;
  max_supply: number;
  status: string;
  generated_count: number;
  progress_percentage: number;
}

export interface GenerationRequest {
  count?: number;
  layerOrder?: string[];
}

export interface GenerationResponse {
  success: boolean;
  message?: string;
  tokenCount?: number;
  status?: GenerationStatus;
  error?: string;
}
