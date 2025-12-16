// Application Constants

import { LayerType } from '@/types';

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Blockchain Configuration
export const CRONOS_TESTNET_CHAIN_ID = 338;
export const CRONOS_MAINNET_CHAIN_ID = 25;
export const DEFAULT_CHAIN_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN === 'mainnet'
    ? CRONOS_MAINNET_CHAIN_ID
    : CRONOS_TESTNET_CHAIN_ID;

// Layer Configuration
export const LAYER_TYPES: LayerType[] = [
  'Background',
  'Body',
  'Eyes',
  'Mouth',
  'Clothes',
  'Accessories',
];

export const DEFAULT_LAYER_ORDER: LayerType[] = LAYER_TYPES;

// File Upload Configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/png'];
export const MAX_FILES_PER_UPLOAD = 50;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Status Labels
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  setup: 'Setup',
  traits_uploaded: 'Traits Uploaded',
  generated: 'Generated',
  deployed: 'Deployed',
};

// Status Colors
export const PROJECT_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  setup: {
    bg: 'rgba(100, 116, 139, 0.2)',
    text: '#94a3b8',
    border: 'rgba(100, 116, 139, 0.3)',
  },
  traits_uploaded: {
    bg: 'rgba(251, 191, 36, 0.2)',
    text: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  generated: {
    bg: 'rgba(96, 165, 250, 0.2)',
    text: '#60a5fa',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  deployed: {
    bg: 'rgba(74, 222, 128, 0.2)',
    text: '#4ade80',
    border: 'rgba(74, 222, 128, 0.3)',
  },
};

// Routes
export const ROUTES = {
  HOME: '/',
  MY_PROJECTS: '/my-projects',
  MY_PROJECTS_NEW: '/my-projects/new',
  MY_PROJECT_DETAIL: (id: string) => `/my-projects/${id}`,
  ADMIN: '/admin',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_PROJECT_DETAIL: (id: string) => `/admin/projects/${id}`,
  PROJECT_MINT: (id: string) => `/project/${id}/mint`,
} as const;
