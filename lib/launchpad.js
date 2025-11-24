import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

export const LaunchpadContract = {
  // Create contract object
  contractObj: async (browserProvider) => {
    try {
      const provider = browserProvider
        ? new ethers.BrowserProvider(browserProvider)
        : new ethers.JsonRpcProvider("https://evm-t3.cronos.org");

      const signer = browserProvider ? await provider.getSigner() : provider;

      return new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        browserProvider ? signer : provider,
      );
    } catch (error) {
      console.error("Error creating contract object:", error);
      throw error;
    }
  },

  // Read Functions
  getMaxSupply: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.maxSupply();
    } catch (error) {
      console.error("Error getting max supply:", error);
      throw error;
    }
  },

  getTotalSupply: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.totalSupply();
    } catch (error) {
      console.error("Error getting total supply:", error);
      throw error;
    }
  },

  getMintPrice: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.mintPrice();
    } catch (error) {
      console.error("Error getting mint price:", error);
      throw error;
    }
  },

  getMaxPerWallet: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.maxPerWallet();
    } catch (error) {
      console.error("Error getting max per wallet:", error);
      throw error;
    }
  },

  getSaleActive: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.saleActive();
    } catch (error) {
      console.error("Error getting sale active:", error);
      throw error;
    }
  },

  getWhitelistSaleActive: async (browserProvider) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.whitelistSaleActive();
    } catch (error) {
      console.error("Error getting whitelist sale active:", error);
      throw error;
    }
  },

  getMintsByWallet: async (browserProvider, address) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      return await contract.mintsByWallet(address);
    } catch (error) {
      console.error("Error getting mints by wallet:", error);
      throw error;
    }
  },

  // Write Functions
  mintPublic: async (browserProvider, quantity, totalValue) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      const tx = await contract.mintPublic(quantity, {
        value: totalValue,
      });
      return await tx.wait();
    } catch (error) {
      console.error("Error minting:", error);
      throw error;
    }
  },

  mintWhitelist: async (browserProvider, quantity, merkleProof, totalValue) => {
    try {
      const contract = await LaunchpadContract.contractObj(browserProvider);
      const tx = await contract.mintWhitelist(quantity, merkleProof, {
        value: totalValue,
      });
      return await tx.wait();
    } catch (error) {
      console.error("Error minting whitelist:", error);
      throw error;
    }
  },

  // Helper function to get all contract info at once
  getContractInfo: async (browserProvider, userAddress = null) => {
    try {
      const [maxSupply, totalSupply, mintPrice, maxPerWallet, saleActive, whitelistSaleActive] =
        await Promise.all([
          LaunchpadContract.getMaxSupply(browserProvider),
          LaunchpadContract.getTotalSupply(browserProvider),
          LaunchpadContract.getMintPrice(browserProvider),
          LaunchpadContract.getMaxPerWallet(browserProvider),
          LaunchpadContract.getSaleActive(browserProvider),
          LaunchpadContract.getWhitelistSaleActive(browserProvider),
        ]);

      let userMints = 0n;
      if (userAddress) {
        userMints = await LaunchpadContract.getMintsByWallet(browserProvider, userAddress);
      }

      return {
        maxSupply: Number(maxSupply),
        totalSupply: Number(totalSupply),
        mintPrice: mintPrice.toString(),
        maxPerWallet: Number(maxPerWallet),
        saleActive,
        whitelistSaleActive,
        userMints: Number(userMints),
      };
    } catch (error) {
      console.error("Error getting contract info:", error);
      throw error;
    }
  },
};

export default LaunchpadContract;
