// Contract configuration
// Deployed on Cronos Testnet

export const CONTRACT_ADDRESS = "0x97A26591f2263490BfADd0EeD6651CB50B1b6D20";

// Cronos Chain configurations
export const CRONOS_MAINNET = {
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

export const CRONOS_TESTNET = {
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

// Contract ABI (minimal for mint page)
export const CONTRACT_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function maxSupply() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function maxPerWallet() view returns (uint256)",
  "function saleActive() view returns (bool)",
  "function whitelistSaleActive() view returns (bool)",
  "function mintsByWallet(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  // Write functions
  "function mintPublic(uint256 quantity) payable",
  "function mintWhitelist(uint256 quantity, bytes32[] merkleProof) payable",
  // Events
  "event PublicMint(address indexed minter, uint256 quantity, uint256 value)",
  "event WhitelistMint(address indexed minter, uint256 quantity, uint256 value)",
];
