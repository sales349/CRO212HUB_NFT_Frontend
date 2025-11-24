"use client";

import { useState, useEffect } from "react";
import { useAppKit, useDisconnect, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { LaunchpadContract } from "../lib/launchpad";

// Collection info
const COLLECTION_NAME = "TEST COLLECTION";
const COLLECTION_DESCRIPTION = "A test NFT collection on Cronos testnet. 100 unique NFTs for testing the minting platform.";

export default function MintPage() {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  // AppKit hooks
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  // Get chain ID from CAIP address (format: eip155:25:0x...)
  const chainId = caipAddress ? parseInt(caipAddress.split(":")[1]) : null;

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!walletProvider || !address) return;
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const balance = await provider.getBalance(address);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  // Fetch contract data
  const fetchContractData = async () => {
    try {
      setLoading(true);
      const info = await LaunchpadContract.getContractInfo(walletProvider, address);
      setContractInfo(info);
      await fetchWalletBalance();
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when wallet connects
  useEffect(() => {
    fetchContractData();
  }, [isConnected, address]);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!minting) {
        fetchContractData();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [minting, address]);

  // Calculate remaining mints for user
  const remainingMints = contractInfo
    ? contractInfo.maxPerWallet - contractInfo.userMints
    : 0;

  // Calculate total price
  const totalPrice = contractInfo
    ? BigInt(contractInfo.mintPrice) * BigInt(quantity)
    : 0n;

  // Get network name
  const getNetworkName = () => {
    if (chainId === 25) return "Cronos Mainnet";
    if (chainId === 338) return "Cronos Testnet";
    return "Unknown Network";
  };

  // Handle mint
  const handleMint = async () => {
    if (!isConnected) {
      setMessage({ type: "error", text: "Please connect your wallet first" });
      return;
    }

    if (!contractInfo?.saleActive) {
      setMessage({ type: "error", text: "Public sale is not active" });
      return;
    }

    if (quantity > remainingMints) {
      setMessage({ type: "error", text: `You can only mint ${remainingMints} more NFTs` });
      return;
    }

    setMessage(null);
    setMinting(true);

    try {
      // Check wallet balance
      const provider = new ethers.BrowserProvider(walletProvider);
      const balance = await provider.getBalance(address);

      // Calculate total cost (mint price + estimated gas ~0.01 CRO)
      const estimatedGas = ethers.parseEther("0.01");
      const totalCost = totalPrice + estimatedGas;

      if (balance < totalCost) {
        const balanceInCro = ethers.formatEther(balance);
        const neededInCro = ethers.formatEther(totalPrice);
        setMessage({
          type: "error",
          text: `Insufficient balance. You have ${parseFloat(balanceInCro).toFixed(4)} CRO but need ${parseFloat(neededInCro).toFixed(2)} CRO + gas fees`
        });
        setMinting(false);
        return;
      }

      const receipt = await LaunchpadContract.mintPublic(
        walletProvider,
        quantity,
        totalPrice.toString()
      );

      const explorerUrl = chainId === 25
        ? `https://cronoscan.com/tx/${receipt.hash}`
        : `https://testnet.cronoscan.com/tx/${receipt.hash}`;

      setMessage({
        type: "success",
        text: `Mint successful! Tx: ${receipt.hash.slice(0, 6)}...${receipt.hash.slice(-4)}`,
        link: explorerUrl,
      });

      // Refresh contract data
      await fetchContractData();
      setQuantity(1);
    } catch (error) {
      console.error("Mint error:", error);
      setMessage({
        type: "error",
        text: error.message || "Transaction failed. Please try again.",
      });
    } finally {
      setMinting(false);
    }
  };

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < remainingMints && quantity < (contractInfo?.maxPerWallet || 5)) {
      setQuantity(q => q + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="page">
      <header>
        <div className="logo">CRO212HUB</div>
        <div className="network-badge">Network: {getNetworkName()}</div>
      </header>

      <h1>{COLLECTION_NAME}</h1>
      <p className="subtitle">{COLLECTION_DESCRIPTION}</p>

      <div className="layout">
        {/* Mint Details Card */}
        <section className="card">
          <h2>Mint Details</h2>
          <div className="row">
            <span className="label">Mint Price</span>
            <span className="value">
              {loading ? "Loading..." : contractInfo ? `${ethers.formatEther(contractInfo.mintPrice)} CRO` : "N/A"}
            </span>
          </div>
          <div className="row">
            <span className="label">Supply</span>
            <span className="value">
              {loading
                ? "Loading..."
                : contractInfo
                ? `${contractInfo.totalSupply.toLocaleString()} / ${contractInfo.maxSupply.toLocaleString()}`
                : "N/A"}
            </span>
          </div>
          <div className="row">
            <span className="label">Max per wallet</span>
            <span className="value">
              {loading ? "Loading..." : contractInfo ? contractInfo.maxPerWallet : "N/A"}
            </span>
          </div>
          <div className="row">
            <span className="label">Public Sale</span>
            <span className="value">
              {loading ? (
                <span className="badge badge-danger">Loading...</span>
              ) : (
                <span className={`badge ${contractInfo?.saleActive ? "badge-success" : "badge-danger"}`}>
                  {contractInfo?.saleActive ? "Active" : "Inactive"}
                </span>
              )}
            </span>
          </div>
          <div className="row">
            <span className="label">Whitelist Sale</span>
            <span className="value">
              {loading ? (
                <span className="badge badge-danger">Loading...</span>
              ) : (
                <span className={`badge ${contractInfo?.whitelistSaleActive ? "badge-success" : "badge-danger"}`}>
                  {contractInfo?.whitelistSaleActive ? "Active" : "Inactive"}
                </span>
              )}
            </span>
          </div>
        </section>

        {/* Wallet & Mint Card */}
        <section className="card">
          <h2>Wallet &amp; Mint</h2>

          {!isConnected ? (
            <>
              <button className="primary-btn" onClick={() => open()}>
                Connect Wallet
              </button>
              <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "10px", textAlign: "center" }}>
                Connect your wallet to mint NFTs
              </p>
            </>
          ) : (
            <>
              <div className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <div className="row" style={{ marginTop: "4px" }}>
                <span className="label">Your balance</span>
                <span className="value">
                  {walletBalance ? `${parseFloat(walletBalance).toFixed(4)} CRO` : "Loading..."}
                </span>
              </div>
              <div className="row" style={{ marginTop: "4px" }}>
                <span className="label">You minted</span>
                <span className="value">
                  {loading ? "..." : `${contractInfo?.userMints || 0} / ${contractInfo?.maxPerWallet || "?"}`}
                </span>
              </div>

              <h3 style={{ fontSize: "14px", marginTop: "14px", marginBottom: "4px" }}>
                Choose quantity
              </h3>
              <div className="quantity-row">
                <button
                  className="qty-btn"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || minting}
                >
                  -
                </button>
                <div className="qty-display">{quantity}</div>
                <button
                  className="qty-btn"
                  onClick={increaseQuantity}
                  disabled={quantity >= remainingMints || minting}
                >
                  +
                </button>
              </div>
              <div className="row">
                <span className="label">Total cost</span>
                <span className="value">
                  {contractInfo ? ethers.formatEther(totalPrice) : "0"} CRO + gas
                </span>
              </div>

              <button
                className="primary-btn"
                onClick={handleMint}
                disabled={!contractInfo?.saleActive || minting || remainingMints <= 0 || loading}
              >
                {minting
                  ? "Minting..."
                  : remainingMints <= 0
                  ? "Max Minted"
                  : "Mint (Public Sale)"}
              </button>

              <button
                className="secondary-btn"
                disabled
              >
                Mint (Whitelist – Coming Soon)
              </button>

              <button
                className="secondary-btn"
                onClick={() => disconnect()}
                style={{ marginTop: "10px" }}
                disabled={minting}
              >
                Disconnect Wallet
              </button>

              {message && (
                <div className={`status-box ${message.type}`}>
                  {message.type === "success" ? "✅ " : "❌ "}
                  {message.text}
                  {message.link && (
                    <>
                      <br />
                      <a href={message.link} target="_blank" rel="noopener noreferrer">
                        (view on Cronoscan)
                      </a>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <div className="links">
        <p>
          Contract: <a href={`https://cronoscan.com/address/${contractInfo ? "0x..." : "#"}`} target="_blank" rel="noopener noreferrer">
            View on Cronoscan
          </a> ·
          Collection: <a href="#" onClick={(e) => e.preventDefault()}>
            View on Marketplace (coming soon)
          </a>
        </p>
      </div>
    </div>
  );
}
