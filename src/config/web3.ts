// Web3 Configuration - Cronos chains and WalletConnect setup

import { defineChain } from 'viem';
import type { ChainConfig } from '@/types';

// Cronos Mainnet Chain
export const cronosMainnet = defineChain({
  id: 25,
  name: 'Cronos Mainnet',
  network: 'cronos',
  nativeCurrency: {
    name: 'Cronos',
    symbol: 'CRO',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_CRONOS_MAINNET_RPC || 'https://evm.cronos.org'],
    },
    public: {
      http: ['https://evm.cronos.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Cronos Explorer',
      url: 'https://explorer.cronos.org',
    },
  },
  testnet: false,
});

// Cronos Testnet Chain
export const cronosTestnet = defineChain({
  id: 338,
  name: 'Cronos Testnet',
  network: 'cronos-testnet',
  nativeCurrency: {
    name: 'Cronos',
    symbol: 'TCRO',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_CRONOS_TESTNET_RPC || 'https://evm-t3.cronos.org'],
    },
    public: {
      http: ['https://evm-t3.cronos.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Cronos Testnet Explorer',
      url: 'https://explorer.cronos.org/testnet',
    },
  },
  testnet: true,
});

// Default chain based on environment
export const defaultChain =
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN === 'mainnet' ? cronosMainnet : cronosTestnet;

// All supported chains
export const supportedChains = [cronosTestnet, cronosMainnet];

// WalletConnect Project ID
export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!walletConnectProjectId) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Get one at https://cloud.reown.com'
  );
}

// Chain metadata
export const chainMetadata: Record<number, ChainConfig> = {
  25: {
    id: 25,
    name: 'Cronos Mainnet',
    network: 'cronos',
    nativeCurrency: {
      name: 'Cronos',
      symbol: 'CRO',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://evm.cronos.org'] },
      public: { http: ['https://evm.cronos.org'] },
    },
    blockExplorers: {
      default: { name: 'Cronos Explorer', url: 'https://explorer.cronos.org' },
    },
    testnet: false,
  },
  338: {
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-testnet',
    nativeCurrency: {
      name: 'Cronos',
      symbol: 'TCRO',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://evm-t3.cronos.org'] },
      public: { http: ['https://evm-t3.cronos.org'] },
    },
    blockExplorers: {
      default: { name: 'Cronos Testnet Explorer', url: 'https://explorer.cronos.org/testnet' },
    },
    testnet: true,
  },
};
