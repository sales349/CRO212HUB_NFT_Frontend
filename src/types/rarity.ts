// Rarity Types and Interfaces

import { TraitAttribute } from './traits';

export interface TokenRarity {
  id: string;
  project_id: string;
  token_id: number;
  image_path: string;
  metadata_path: string;
  attributes: TraitAttribute[];
  rarity_score: number | null;
  rarity_rank: number | null;
  created_at: string;
}

export interface RarityScore {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface RarityStatistics {
  calculated: boolean;
  total_tokens: number;
  scores: RarityScore;
  rarest_token: TokenRarity | null;
  most_common_token: TokenRarity | null;
}

export interface RarityCalculateResponse {
  success: boolean;
  statistics?: RarityStatistics;
  rarestToken?: TokenRarity;
  mostCommonToken?: TokenRarity;
  error?: string;
}

export interface RarityStatsResponse {
  success: boolean;
  statistics?: RarityStatistics;
  error?: string;
}

export interface TokenListResponse {
  success: boolean;
  tokens: TokenRarity[];
  total: number;
  error?: string;
}
