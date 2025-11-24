"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

// Cronos Networks Configuration
const cronosMainnet = {
  id: 25,
  name: "Cronos",
  network: "cronos",
  nativeCurrency: {
    decimals: 18,
    name: "Cronos",
    symbol: "CRO",
  },
  rpcUrls: {
    default: { http: ["https://evm.cronos.org"] },
    public: { http: ["https://evm.cronos.org"] },
  },
  blockExplorers: {
    default: { name: "Cronoscan", url: "https://cronoscan.com" },
  },
};

const cronosTestnet = {
  id: 338,
  name: "Cronos Testnet",
  network: "cronos-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Test CRO",
    symbol: "TCRO",
  },
  rpcUrls: {
    default: { http: ["https://evm-t3.cronos.org"] },
    public: { http: ["https://evm-t3.cronos.org"] },
  },
  blockExplorers: {
    default: { name: "Cronoscan Testnet", url: "https://testnet.cronoscan.com" },
  },
};

// WalletConnect Project ID
const projectId = "d7f6ee088f34fc3e8748068a551d5954";

// Metadata
const metadata = {
  name: "CRO212HUB NFT Mint",
  description: "NFT Minting on Cronos",
  url: typeof window !== "undefined" ? window.location.origin : "https://cro212hub.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [cronosTestnet, cronosMainnet],
  projectId,
  features: {
    analytics: false,
  },
});

export function AppKitProvider({ children }) {
  return <>{children}</>;
}
