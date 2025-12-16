// Public Mint Page - For minting NFTs from deployed projects

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { projectsApi } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import { NFT_CONTRACT_ABI } from '@/lib/contracts/nft-contract';
import type { Project } from '@/types';

export default function PublicMintPage() {
  const router = useRouter();
  const params = useParams();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minting, setMinting] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [saleActive, setSaleActive] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activatingSale, setActivatingSale] = useState(false);

  const projectId = params.id as string;

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getById(projectId);

        if (response.success && response.project) {
          if (response.project.status !== 'deployed') {
            setError('This project has not been deployed yet');
            return;
          }
          setProject(response.project);
        } else {
          setError(response.error || 'Project not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Fetch contract data
  useEffect(() => {
    if (!project?.contract_address || typeof window === 'undefined' || !window.ethereum) return;

    const fetchContractData = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum!);
        const contract = new Contract(project.contract_address!, NFT_CONTRACT_ABI, provider);

        const [supply, saleActiveStatus, contractOwner] = await Promise.all([
          contract.totalSupply(),
          contract.saleActive(),
          contract.owner(),
        ]);

        setTotalSupply(Number(supply));
        setSaleActive(saleActiveStatus);

        // Check if connected wallet is the owner
        if (address) {
          setIsOwner(contractOwner.toLowerCase() === address.toLowerCase());
        }
      } catch (err) {
        console.error('Failed to fetch contract data:', err);
      }
    };

    fetchContractData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, [project?.contract_address, address]);

  const handleMint = async () => {
    if (!isConnected) {
      open();
      return;
    }

    if (!project?.contract_address) {
      setError('Contract address not found');
      return;
    }

    if (!saleActive) {
      setError('Sale is not active yet. Please wait for the owner to activate the sale.');
      return;
    }

    try {
      setMinting(true);
      setError(null);

      if (!window.ethereum) {
        setError('No Web3 wallet detected');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(project.contract_address, NFT_CONTRACT_ABI, signer);

      // Calculate total cost
      const mintPrice = parseEther(project.mint_price);
      const totalCost = mintPrice * BigInt(mintQuantity);

      // Execute mint transaction (use mintPublic function)
      const tx = await contract.mintPublic(mintQuantity, { value: totalCost });

      // Wait for confirmation
      await tx.wait();

      // Refresh contract data
      const supply = await contract.totalSupply();
      setTotalSupply(Number(supply));

      alert(`Successfully minted ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}!`);
      setMintQuantity(1);
    } catch (err: any) {
      console.error('Minting error:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient funds for minting');
      } else if (err.message?.includes('Sale not active')) {
        setError('Sale is not active yet');
      } else if (err.message?.includes('Exceeds max supply')) {
        setError('Not enough NFTs remaining');
      } else if (err.message?.includes('Exceeds wallet limit')) {
        setError('You have reached the maximum mints per wallet');
      } else if (err.message?.includes('Insufficient payment')) {
        setError('Insufficient payment amount');
      } else {
        setError(err.shortMessage || err.message || 'Failed to mint NFT');
      }
    } finally {
      setMinting(false);
    }
  };

  const handleActivateSale = async () => {
    if (!isConnected || !isOwner) {
      setError('Only the contract owner can activate the sale');
      return;
    }

    if (!project?.contract_address) {
      setError('Contract address not found');
      return;
    }

    try {
      setActivatingSale(true);
      setError(null);

      if (!window.ethereum) {
        setError('No Web3 wallet detected');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(project.contract_address, NFT_CONTRACT_ABI, signer);

      // Call setSaleState(true, false) to activate public sale
      const tx = await contract.setSaleState(true, false);

      alert('Transaction submitted! Activating sale...');
      await tx.wait();

      // Refresh contract data
      const saleActiveStatus = await contract.saleActive();
      setSaleActive(saleActiveStatus);

      alert('Sale activated successfully!');
    } catch (err: any) {
      console.error('Sale activation error:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected');
      } else {
        setError(err.shortMessage || err.message || 'Failed to activate sale');
      }
    } finally {
      setActivatingSale(false);
    }
  };

  const incrementQuantity = () => {
    if (project && mintQuantity < Math.min(10, project.max_supply - (totalSupply || 0))) {
      setMintQuantity(mintQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (mintQuantity > 1) {
      setMintQuantity(mintQuantity - 1);
    }
  };

  const calculateTotal = () => {
    if (!project) return '0';
    return (parseFloat(project.mint_price) * mintQuantity).toFixed(4);
  };

  const remaining = project ? project.max_supply - (totalSupply || 0) : 0;
  const progress = project && totalSupply !== null
    ? Math.round((totalSupply / project.max_supply) * 100)
    : 0;

  if (loading) {
    return (
      <div className="page">
        <div className="status-box info">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page">
        <div className="status-box error">{error || 'Project not found'}</div>
        <button onClick={() => router.push('/')} className="primary-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo">CRO212HUB</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isConnected ? (
            <>
              <div className="wallet-address">{formatAddress(address)}</div>
              <button
                onClick={() => router.push('/')}
                className="secondary-btn"
                style={{ width: 'auto', padding: '4px 12px' }}
              >
                Home
              </button>
            </>
          ) : (
            <button onClick={() => open()} className="connect-btn" style={{ width: 'auto' }}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <h1>{project.name}</h1>
      <p className="subtitle">{project.description || 'NFT Collection on Cronos Blockchain'}</p>

      <div className="layout">
        {/* Mint Card */}
        <section className="card">
          <h2>Mint NFT</h2>

          <div className="row">
            <span className="label">Supply</span>
            <span className="value">
              {totalSupply !== null ? totalSupply.toLocaleString() : '...'} /{' '}
              {project.max_supply.toLocaleString()}
            </span>
          </div>

          <div className="row">
            <span className="label">Remaining</span>
            <span className="value">{remaining.toLocaleString()}</span>
          </div>

          <div className="row">
            <span className="label">Price</span>
            <span className="value">{project.mint_price} CRO</span>
          </div>

          <div className="row">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge ${!saleActive ? 'badge-danger' : 'badge-success'}`}>
                {saleActive ? 'Sale Active' : 'Sale Not Active'}
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          {totalSupply !== null && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Progress</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{progress}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-card-secondary)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--gradient-primary)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
              Quantity
            </label>
            <div className="quantity-row">
              <button
                onClick={decrementQuantity}
                className="qty-btn"
                disabled={mintQuantity <= 1}
              >
                -
              </button>
              <span className="qty-display">{mintQuantity}</span>
              <button
                onClick={incrementQuantity}
                className="qty-btn"
                disabled={mintQuantity >= Math.min(10, remaining)}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Cost */}
          <div className="row" style={{ marginTop: '12px', fontSize: '16px' }}>
            <span className="label">Total</span>
            <span className="value">{calculateTotal()} CRO</span>
          </div>

          {/* Owner Controls - Only visible to contract owner */}
          {isOwner && !saleActive && (
            <div
              className="status-box warning"
              style={{ marginTop: '12px', padding: '12px', background: '#1e293b' }}
            >
              <p style={{ fontSize: '13px', marginBottom: '10px', color: '#fbbf24' }}>
                <strong>Owner Controls:</strong> Sale is not active. Activate it to allow public minting.
              </p>
              <button
                onClick={handleActivateSale}
                className="primary-btn"
                disabled={activatingSale}
                style={{ marginTop: '0', width: '100%' }}
              >
                {activatingSale ? 'Activating...' : 'Activate Public Sale'}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="status-box error" style={{ marginTop: '12px' }}>
              {error}
            </div>
          )}

          {/* Mint Button */}
          {!isConnected ? (
            <button onClick={() => open()} className="primary-btn">
              Connect Wallet to Mint
            </button>
          ) : remaining <= 0 ? (
            <button className="primary-btn" disabled>
              Sold Out
            </button>
          ) : !saleActive ? (
            <button className="primary-btn" disabled>
              Public Sale Not Live
            </button>
          ) : (
            <button onClick={handleMint} className="primary-btn" disabled={minting}>
              {minting ? 'Minting...' : `Mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}`}
            </button>
          )}
        </section>

        {/* Project Info */}
        <section className="card">
          <h2>Collection Details</h2>

          <div className="row">
            <span className="label">Symbol</span>
            <span className="value">{project.symbol}</span>
          </div>

          <div className="row">
            <span className="label">Blockchain</span>
            <span className="value">Cronos Testnet</span>
          </div>

          <div className="row">
            <span className="label">Standard</span>
            <span className="value">ERC-721</span>
          </div>

          <div className="row">
            <span className="label">Contract</span>
            <div className="wallet-address" style={{ marginBottom: '0' }}>
              {formatAddress(project.contract_address || '', 6)}
            </div>
          </div>

          <a
            href={`https://explorer.cronos.org/testnet/address/${project.contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ marginTop: '12px', textAlign: 'center', textDecoration: 'none' }}
          >
            View on Explorer
          </a>
        </section>
      </div>

      {/* Footer */}
      <div className="links">
        <p>
          Powered by CRO212HUB NFT Generator ·{' '}
          <a href="/" rel="noopener noreferrer">
            Create Your Own Collection
          </a>
        </p>
      </div>
    </div>
  );
}
