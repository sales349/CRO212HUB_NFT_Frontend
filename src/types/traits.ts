// Traits Types and Interfaces

export type LayerType =
  | 'Background'
  | 'Body'
  | 'Eyes'
  | 'Mouth'
  | 'Clothes'
  | 'Accessories';

export const LAYER_TYPES: LayerType[] = [
  'Background',
  'Body',
  'Eyes',
  'Mouth',
  'Clothes',
  'Accessories',
];

export interface Trait {
  id: string;
  project_id: string;
  layer_type: LayerType;
  trait_name: string;
  file_path: string;
  created_at: string;
}

export interface TraitAttribute {
  trait_type: string;
  value: string;
}

export interface TraitUploadData {
  layerType: LayerType;
  files: File[];
}

export interface TraitUploadResponse {
  success: boolean;
  traits?: Trait[];
  uploaded_count?: number;
  error?: string;
}

export interface TraitListResponse {
  success: boolean;
  traits: Trait[];
  error?: string;
}

export interface TraitsByLayer {
  [key: string]: Trait[];
}
