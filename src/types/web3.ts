// Web3 Types and Interfaces

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
  blockExplorers: {
    default: { name: string; url: string };
  };
  testnet?: boolean;
}

export interface WalletInfo {
  address: string | undefined;
  isConnected: boolean;
  chainId: number | null;
  balance?: string;
}

export interface ContractInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
  maxSupply: number;
  mintPrice: string;
  paused: boolean;
  owner: string;
}

export interface MintParams {
  quantity: number;
  value: string;
}

export interface TransactionStatus {
  hash?: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  error?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}
