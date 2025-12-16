// Project Detail Page - Individual project management

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { BrowserProvider, Contract } from 'ethers';
import { projectsApi } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import { NFT_CONTRACT_ABI } from '@/lib/contracts/nft-contract';
import type { Project } from '@/types';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAppKitAccount();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saleActive, setSaleActive] = useState(false);
  const [activatingSale, setActivatingSale] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getById(projectId);

        if (response.success && response.project) {
          // Verify user owns this project
          if (response.project.wallet_address?.toLowerCase() !== address?.toLowerCase()) {
            setError('You do not have permission to view this project');
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
  }, [projectId, address, isConnected, router]);

  // Fetch contract data if deployed
  useEffect(() => {
    if (!project?.contract_address || typeof window === 'undefined' || !window.ethereum) return;

    const fetchContractData = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum!);
        const contract = new Contract(project.contract_address!, NFT_CONTRACT_ABI, provider);

        const saleActiveStatus = await contract.saleActive();
        setSaleActive(saleActiveStatus);
      } catch (err) {
        console.error('Failed to fetch contract data:', err);
      }
    };

    fetchContractData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, [project?.contract_address]);

  const handleActivateSale = async () => {
    if (!project?.contract_address) {
      alert('Contract address not found');
      return;
    }

    try {
      setActivatingSale(true);

      if (!window.ethereum) {
        alert('No Web3 wallet detected');
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
        alert('Transaction was rejected');
      } else {
        alert(err.shortMessage || err.message || 'Failed to activate sale');
      }
    } finally {
      setActivatingSale(false);
    }
  };

  if (!isConnected) {
    return null; // Will redirect
  }

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
        <button onClick={() => router.push('/my-projects')} className="primary-btn">
          Back to My Projects
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
          <div className="wallet-address">{formatAddress(address)}</div>
          <button
            onClick={() => router.push('/my-projects')}
            className="secondary-btn"
            style={{ width: 'auto', padding: '4px 12px' }}
          >
            Back to Projects
          </button>
        </div>
      </header>

      <h1>{project.name}</h1>
      <p className="subtitle">
        Manage your NFT collection. Upload traits, generate artwork, calculate rarity, and deploy to
        Cronos blockchain.
      </p>

      <div className="layout">
        {/* Project Information */}
        <section className="card">
          <h2>Project Details</h2>

          <div className="row">
            <span className="label">Name</span>
            <span className="value">{project.name}</span>
          </div>

          <div className="row">
            <span className="label">Symbol</span>
            <span className="value">{project.symbol}</span>
          </div>

          <div className="row">
            <span className="label">Status</span>
            <span className="value">
              <span
                className={`badge ${
                  project.status === 'deployed'
                    ? 'badge-success'
                    : project.status === 'generated'
                      ? 'badge-info'
                      : project.status === 'traits_uploaded'
                        ? 'badge-warning'
                        : 'badge-danger'
                }`}
              >
                {project.status.replace('_', ' ')}
              </span>
            </span>
          </div>

          <div className="row">
            <span className="label">Max Supply</span>
            <span className="value">{project.max_supply.toLocaleString()}</span>
          </div>

          <div className="row">
            <span className="label">Mint Price</span>
            <span className="value">{project.mint_price} CRO</span>
          </div>

          {project.description && (
            <>
              <h3>Description</h3>
              <p className="links" style={{ marginTop: '6px' }}>
                {project.description}
              </p>
            </>
          )}
        </section>

        {/* Blockchain Information */}
        <section className="card">
          <h2>Blockchain Details</h2>

          <div className="row">
            <span className="label">Owner Wallet</span>
            <div className="wallet-address" style={{ marginBottom: '0' }}>
              {formatAddress(project.wallet_address)}
            </div>
          </div>

          {project.treasury_address && (
            <div className="row">
              <span className="label">Treasury</span>
              <div className="wallet-address" style={{ marginBottom: '0' }}>
                {formatAddress(project.treasury_address)}
              </div>
            </div>
          )}

          {project.revenue_split !== undefined && project.revenue_split > 0 && (
            <div className="row">
              <span className="label">Revenue Split</span>
              <span className="value">{project.revenue_split}%</span>
            </div>
          )}

          {project.contract_address && (
            <>
              <div className="row">
                <span className="label">Contract Address</span>
                <div className="wallet-address" style={{ marginBottom: '0' }}>
                  {formatAddress(project.contract_address, 6)}
                </div>
              </div>

              <div className="row">
                <span className="label">Sale Status</span>
                <span className="value">
                  <span className={`badge ${!saleActive ? 'badge-danger' : 'badge-success'}`}>
                    {saleActive ? 'Active' : 'Not Active'}
                  </span>
                </span>
              </div>

              {!saleActive && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#1e293b', borderRadius: '8px', border: '1px solid #374151' }}>
                  <p style={{ fontSize: '13px', marginBottom: '10px', color: '#fbbf24' }}>
                    ⚠️ <strong>Public sale is not active.</strong> Activate it to allow users to mint NFTs.
                  </p>
                  <button
                    onClick={handleActivateSale}
                    className="primary-btn"
                    disabled={activatingSale}
                    style={{ marginTop: '0', width: '100%' }}
                  >
                    {activatingSale ? 'Activating Sale...' : 'Activate Public Sale'}
                  </button>
                </div>
              )}

              <a
                href={`https://explorer.cronos.org/testnet/address/${project.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
                style={{ marginTop: '10px', textAlign: 'center', textDecoration: 'none' }}
              >
                View on Explorer
              </a>
            </>
          )}
        </section>

        {/* Project Workflow */}
        <section className="card" style={{ flex: '1 1 100%' }}>
          <h2>Project Workflow</h2>

          <div className="layout">
            {/* Step 1: Upload Traits */}
            <div className="card" style={{ background: 'var(--bg-card-secondary)' }}>
              <h3 style={{ marginTop: '0' }}>1. Upload Traits</h3>
              <p className="links">
                Upload PNG images for each trait layer (Background, Body, Eyes, Mouth, Clothes,
                Accessories).
              </p>
              {project.status === 'setup' ? (
                <button
                  onClick={() => router.push(`/my-projects/${project.id}/upload-traits`)}
                  className="primary-btn"
                >
                  Upload Traits
                </button>
              ) : (
                <div className="status-box" style={{ marginTop: '10px' }}>
                  ✅ Traits uploaded
                </div>
              )}
            </div>

            {/* Step 2: Generate Collection */}
            <div className="card" style={{ background: 'var(--bg-card-secondary)' }}>
              <h3 style={{ marginTop: '0' }}>2. Generate Collection</h3>
              <p className="links">
                Generate unique NFT combinations and calculate rarity scores for your collection.
              </p>
              {project.status === 'traits_uploaded' ? (
                <button
                  onClick={() => router.push(`/my-projects/${project.id}/generate`)}
                  className="primary-btn"
                >
                  Generate Now
                </button>
              ) : project.status === 'generated' || project.status === 'deployed' ? (
                <div className="status-box" style={{ marginTop: '10px' }}>
                  ✅ Collection generated
                </div>
              ) : (
                <div className="status-box warning" style={{ marginTop: '10px' }}>
                  ⚠️ Upload traits first
                </div>
              )}
            </div>

            {/* Step 3: Deploy Contract */}
            <div className="card" style={{ background: 'var(--bg-card-secondary)' }}>
              <h3 style={{ marginTop: '0' }}>3. Deploy Contract</h3>
              <p className="links">
                Deploy your ERC-721 smart contract to Cronos blockchain and start minting.
              </p>
              {project.status === 'generated' ? (
                <button
                  onClick={() => router.push(`/my-projects/${project.id}/deploy`)}
                  className="primary-btn"
                >
                  Deploy Contract
                </button>
              ) : project.status === 'deployed' ? (
                <div className="status-box" style={{ marginTop: '10px' }}>
                  ✅ Contract deployed
                </div>
              ) : (
                <div className="status-box warning" style={{ marginTop: '10px' }}>
                  ⚠️ Generate collection first
                </div>
              )}
            </div>

            {/* Step 4: Launch Mint Page */}
            <div className="card" style={{ background: 'var(--bg-card-secondary)' }}>
              <h3 style={{ marginTop: '0' }}>4. Launch Mint Page</h3>
              <p className="links">Access your public mint page and share it with your community.</p>
              {project.status === 'deployed' ? (
                <>
                  {!saleActive && (
                    <div className="status-box warning" style={{ marginTop: '0', marginBottom: '10px' }}>
                      ⚠️ <strong>Public sale not active.</strong> Users won't be able to mint until you activate the sale.
                    </div>
                  )}
                  <button
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="primary-btn"
                  >
                    View Mint Page
                  </button>
                </>
              ) : (
                <div className="status-box warning" style={{ marginTop: '10px' }}>
                  ⚠️ Deploy contract first
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="card" style={{ flex: '1 1 100%' }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push(`/my-projects/${project.id}/edit`)}
              className="secondary-btn"
              style={{ flex: '1 1 auto' }}
            >
              Edit Project Details
            </button>
            {project.status === 'generated' || project.status === 'deployed' ? (
              <button
                onClick={() => router.push(`/my-projects/${project.id}/rarity`)}
                className="secondary-btn"
                style={{ flex: '1 1 auto' }}
              >
                View Rarity Data
              </button>
            ) : null}
            {project.status === 'deployed' && (
              <button
                onClick={() => {
                  const mintUrl = `${window.location.origin}/project/${project.id}`;
                  navigator.clipboard.writeText(mintUrl);
                  alert('Mint page URL copied to clipboard!');
                }}
                className="secondary-btn"
                style={{ flex: '1 1 auto' }}
              >
                Copy Mint Page URL
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="links">
        <p>Need help? Contact support or check our documentation for guidance.</p>
      </div>
    </div>
  );
}
