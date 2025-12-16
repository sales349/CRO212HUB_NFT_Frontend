// My Projects Page - User's NFT Project Dashboard

'use client';

import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useProjects } from '@/lib/hooks';
import { formatAddress } from '@/lib/utils';
import { useEffect } from 'react';

export default function MyProjectsPage() {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { projects, loading, error, refetch } = useProjects();

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Filter projects by current user (in a real app, this would be done server-side)
  const myProjects = projects.filter((p) => p.wallet_address?.toLowerCase() === address?.toLowerCase());

  if (!isConnected) {
    return null; // Will redirect
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo">CRO212HUB</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="wallet-address">{formatAddress(address)}</div>
          <button
            onClick={() => router.push('/')}
            className="secondary-btn"
            style={{ width: 'auto', padding: '4px 12px' }}
          >
            Back to Home
          </button>
        </div>
      </header>

      <h1>My NFT Projects</h1>
      <p className="subtitle">
        Manage your NFT collections. Create new projects, upload traits, generate artwork, and deploy
        smart contracts to Cronos blockchain.
      </p>

      {/* Create New Project Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/my-projects/create')}
          className="primary-btn"
          style={{ width: 'auto', padding: '10px 24px' }}
        >
          + Create New Project
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="status-box error" style={{ marginBottom: '20px' }}>
          Error loading projects: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="status-box info">Loading your projects...</div>}

      {/* Empty State */}
      {!loading && !error && myProjects.length === 0 && (
        <section className="card">
          <h2>No Projects Yet</h2>
          <p className="links">
            You haven't created any NFT projects yet. Start by creating your first project and bring your
            collection to life on Cronos blockchain.
          </p>
          <button onClick={() => router.push('/my-projects/create')} className="primary-btn">
            Create Your First Project
          </button>
        </section>
      )}

      {/* Projects Grid */}
      {!loading && myProjects.length > 0 && (
        <div className="layout">
          {myProjects.map((project) => (
            <section
              key={project.id}
              className="card"
              onClick={() => router.push(`/my-projects/${project.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <h2>{project.name}</h2>

              <div className="row" style={{ marginTop: '8px' }}>
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

              {project.contract_address && (
                <div className="row">
                  <span className="label">Contract</span>
                  <div className="wallet-address" style={{ marginBottom: '0' }}>
                    {formatAddress(project.contract_address, 6)}
                  </div>
                </div>
              )}

              {project.description && (
                <p className="links" style={{ marginTop: '10px' }}>
                  {project.description.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description}
                </p>
              )}

              {/* Quick Actions */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                {project.status === 'setup' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/my-projects/${project.id}/upload-traits`);
                    }}
                    className="secondary-btn"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Upload Traits
                  </button>
                )}
                {project.status === 'traits_uploaded' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/my-projects/${project.id}/generate`);
                    }}
                    className="secondary-btn"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Generate Collection
                  </button>
                )}
                {project.status === 'generated' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/my-projects/${project.id}/deploy`);
                    }}
                    className="secondary-btn"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Deploy Contract
                  </button>
                )}
                {project.status === 'deployed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/project/${project.id}`);
                    }}
                    className="primary-btn"
                    style={{ fontSize: '12px', padding: '4px 10px', marginTop: '0' }}
                  >
                    View Mint Page
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Statistics Card */}
      {!loading && myProjects.length > 0 && (
        <section className="card" style={{ marginTop: '24px' }}>
          <h2>Your Statistics</h2>
          <div className="layout">
            <div>
              <div className="row">
                <span className="label">Total Projects</span>
                <span className="value" style={{ fontSize: '18px' }}>
                  {myProjects.length}
                </span>
              </div>
            </div>
            <div>
              <div className="row">
                <span className="label">Generated Collections</span>
                <span className="value" style={{ fontSize: '18px' }}>
                  {myProjects.filter((p) => p.status === 'generated' || p.status === 'deployed').length}
                </span>
              </div>
            </div>
            <div>
              <div className="row">
                <span className="label">Deployed Contracts</span>
                <span className="value" style={{ fontSize: '18px' }}>
                  {myProjects.filter((p) => p.status === 'deployed').length}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="links">
        <p>
          Need help? Check out our{' '}
          <a href="https://cronos.org" target="_blank" rel="noopener noreferrer">
            documentation
          </a>{' '}
          or contact support.
        </p>
      </div>
    </div>
  );
}
