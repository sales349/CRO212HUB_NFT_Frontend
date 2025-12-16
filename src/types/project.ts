// Project Types and Interfaces

export type ProjectStatus = 'setup' | 'traits_uploaded' | 'generated' | 'deployed';

export interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string;
  max_supply: number;
  mint_price: string;
  wallet_address?: string;
  treasury_wallet?: string;
  treasury_address?: string;
  revenue_split?: number;
  platform_fee_bps?: number;
  contract_address?: string | null;
  status: ProjectStatus;
  layer_order?: string[] | null;
  rarity_config?: Record<string, Record<string, number>> | null;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  name: string;
  symbol: string;
  description: string;
  max_supply: number | string;
  mint_price: string;
  wallet_address: string;
  treasury_address?: string;
  revenue_split?: number;
}

export interface ProjectStats {
  total_projects: number;
  generated_collections: number;
  deployed_contracts: number;
  total_nfts_generated: number;
}

export interface ProjectCreateResponse {
  success: boolean;
  project?: Project;
  error?: string;
}

export interface ProjectListResponse {
  success: boolean;
  projects: Project[];
  error?: string;
}

export interface ProjectDetailResponse {
  success: boolean;
  project?: Project;
  error?: string;
}
