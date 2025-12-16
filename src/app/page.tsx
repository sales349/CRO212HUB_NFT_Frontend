// Landing Page - Matching Mint Page Design

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useProjects } from '@/lib/hooks';
import { formatAddress } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { projects, loading } = useProjects();

  const [activeSection, setActiveSection] = useState<'home' | 'projects' | 'create'>('home');

  const stats = {
    totalProjects: projects.length,
    generatedCollections: projects.filter((p) => p.status === 'generated').length,
    deployedContracts: projects.filter((p) => p.status === 'deployed').length,
  };

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
                onClick={() => router.push('/my-projects')}
                className="connect-btn"
                style={{ width: 'auto', padding: '4px 12px' }}
              >
                My Projects
              </button>
            </>
          ) : (
            <button onClick={() => open()} className="connect-btn" style={{ width: 'auto' }}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['home', 'projects', 'create'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              border: activeSection === section ? '1px solid #6366f1' : '1px solid #4b5563',
              background:
                activeSection === section ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
              fontWeight: activeSection === section ? '600' : '400',
            }}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Home Section */}
      {activeSection === 'home' && (
        <div className="fade-in">
          <h1>NFT Generator & Launchpad for Cronos</h1>
          <p className="subtitle">
            Create, generate, and launch your NFT collection on Cronos blockchain. Upload trait
            layers, generate unique artwork, calculate rarity scores, and deploy smart contracts -
            all in one unified platform.
          </p>

          {/* Feature Cards */}
          <div className="layout" style={{ marginBottom: '20px' }}>
            <section className="card">
              <h2>🎨 NFT Generator</h2>
              <div className="row">
                <span className="label">Layer-Based</span>
                <span className="value">
                  <span className="badge badge-success">Active</span>
                </span>
              </div>
              <div className="row">
                <span className="label">Supported Layers</span>
                <span className="value">6 Types</span>
              </div>
              <div className="row">
                <span className="label">Format</span>
                <span className="value">PNG</span>
              </div>
              <p className="links">
                Upload trait layers (Background, Body, Eyes, Mouth, Clothes, Accessories) and
                generate unique NFT collections with randomized combinations.
              </p>
            </section>

            <section className="card">
              <h2>📊 Rarity Engine</h2>
              <div className="row">
                <span className="label">Algorithm</span>
                <span className="value">Trait Frequency</span>
              </div>
              <div className="row">
                <span className="label">Export</span>
                <span className="value">CSV</span>
              </div>
              <div className="row">
                <span className="label">Analytics</span>
                <span className="value">
                  <span className="badge badge-info">Enabled</span>
                </span>
              </div>
              <p className="links">
                Automatic rarity calculation for every token with detailed statistics, rankings,
                and CSV export for comprehensive data analysis.
              </p>
            </section>

            <section className="card">
              <h2>🚀 Smart Contracts</h2>
              <div className="row">
                <span className="label">Standard</span>
                <span className="value">ERC-721</span>
              </div>
              <div className="row">
                <span className="label">Network</span>
                <span className="value">Cronos</span>
              </div>
              <div className="row">
                <span className="label">Revenue Split</span>
                <span className="value">
                  <span className="badge badge-success">Yes</span>
                </span>
              </div>
              <p className="links">
                Deploy production-ready ERC-721 smart contracts with built-in revenue splitting,
                minting functionality, and pause controls.
              </p>
            </section>

            <section className="card">
              <h2>💎 Mint Pages</h2>
              <div className="row">
                <span className="label">Customizable</span>
                <span className="value">
                  <span className="badge badge-info">Yes</span>
                </span>
              </div>
              <div className="row">
                <span className="label">Wallet Connect</span>
                <span className="value">Reown AppKit</span>
              </div>
              <div className="row">
                <span className="label">Responsive</span>
                <span className="value">
                  <span className="badge badge-success">Mobile</span>
                </span>
              </div>
              <p className="links">
                Beautiful, customizable mint pages with wallet integration, real-time supply
                tracking, and seamless minting experience.
              </p>
            </section>
          </div>

          {/* Platform Stats */}
          <section className="card">
            <h2>Platform Statistics</h2>
            <div className="layout">
              <div>
                <div className="row">
                  <span className="label">Total Projects</span>
                  <span className="value" style={{ fontSize: '18px' }}>
                    {stats.totalProjects}
                  </span>
                </div>
              </div>
              <div>
                <div className="row">
                  <span className="label">Generated Collections</span>
                  <span className="value" style={{ fontSize: '18px' }}>
                    {stats.generatedCollections}
                  </span>
                </div>
              </div>
              <div>
                <div className="row">
                  <span className="label">Deployed Contracts</span>
                  <span className="value" style={{ fontSize: '18px' }}>
                    {stats.deployedContracts}
                  </span>
                </div>
              </div>
            </div>

            {!isConnected && (
              <div>
                <button onClick={() => open()} className="primary-btn">
                  Connect Wallet to Get Started
                </button>
              </div>
            )}

            {isConnected && (
              <div>
                <button onClick={() => router.push('/my-projects')} className="primary-btn">
                  Go to My Projects
                </button>
                <button
                  onClick={() => setActiveSection('projects')}
                  className="secondary-btn"
                >
                  Browse All Projects
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Projects Section */}
      {activeSection === 'projects' && (
        <div className="fade-in">
          <h1>All NFT Projects</h1>
          <p className="subtitle">
            Browse and explore NFT collections created on CRO212HUB. Each project showcases unique
            traits, rarity distributions, and minting details.
          </p>

          {loading ? (
            <div className="status-box info">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="card">
              <h2>No Projects Yet</h2>
              <p className="links">
                Be the first to create an NFT project on CRO212HUB. Connect your wallet and start
                building your collection today.
              </p>
              <button
                onClick={() => {
                  if (isConnected) {
                    router.push('/my-projects');
                  } else {
                    open();
                  }
                }}
                className="primary-btn"
              >
                {isConnected ? 'Create Project' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="layout">
              {projects.map((project) => (
                <section
                  key={project.id}
                  className="card"
                  onClick={() => router.push(`/project/${project.id}`)}
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
                  {project.description && (
                    <p className="links" style={{ marginTop: '10px' }}>
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </p>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Section */}
      {activeSection === 'create' && (
        <div className="fade-in">
          <h1>Create Your NFT Collection</h1>
          <p className="subtitle">
            Launch your own NFT project on Cronos blockchain. Follow these simple steps to bring
            your collection to life.
          </p>

          <div className="layout">
            <section className="card">
              <h2>Step 1: Connect Wallet</h2>
              <div className="row">
                <span className="label">Status</span>
                <span className="value">
                  <span className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </span>
              </div>
              {isConnected && (
                <div className="row">
                  <span className="label">Address</span>
                  <div className="wallet-address" style={{ marginBottom: '0' }}>
                    {formatAddress(address)}
                  </div>
                </div>
              )}
              <p className="links">
                Connect your Cronos wallet to get started. We support MetaMask, WalletConnect, and
                all major Web3 wallets.
              </p>
              {!isConnected && <button onClick={() => open()} className="primary-btn">Connect Wallet</button>}
            </section>

            <section className="card">
              <h2>Step 2: Create Project</h2>
              <div className="row">
                <span className="label">Required</span>
                <span className="value">Name, Symbol, Supply</span>
              </div>
              <div className="row">
                <span className="label">Optional</span>
                <span className="value">Description, Treasury</span>
              </div>
              <p className="links">
                Fill in your project details including collection name, symbol, max supply, and
                mint price. Set up revenue splits and treasury wallet.
              </p>
            </section>

            <section className="card">
              <h2>Step 3: Upload Traits</h2>
              <div className="row">
                <span className="label">Layers</span>
                <span className="value">6 Trait Types</span>
              </div>
              <div className="row">
                <span className="label">Format</span>
                <span className="value">PNG (Recommended)</span>
              </div>
              <div className="row">
                <span className="label">Max Size</span>
                <span className="value">10MB per file</span>
              </div>
              <p className="links">
                Upload PNG images for each trait layer: Background, Body, Eyes, Mouth, Clothes,
                and Accessories. Mix and match to create unique combinations.
              </p>
            </section>

            <section className="card">
              <h2>Step 4: Generate & Deploy</h2>
              <div className="row">
                <span className="label">Generation</span>
                <span className="value">Automated</span>
              </div>
              <div className="row">
                <span className="label">Rarity</span>
                <span className="value">Auto-calculated</span>
              </div>
              <div className="row">
                <span className="label">Deployment</span>
                <span className="value">One-click</span>
              </div>
              <p className="links">
                Generate your entire collection with one click. Calculate rarity scores, export
                CSV data, and deploy your smart contract to Cronos.
              </p>
            </section>
          </div>

          {isConnected ? (
            <div className="status-box">
              ✅ Your wallet is connected! You're ready to create your first project.
              <button
                onClick={() => router.push('/my-projects')}
                className="primary-btn"
                style={{ marginTop: '12px' }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="status-box warning">
              ⚠️ Please connect your wallet to continue. Click the "Connect Wallet" button above.
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="links">
        <p>
          CRO212HUB NFT Generator & Launchpad · Built on Cronos ·{' '}
          <a href="https://cronos.org" target="_blank" rel="noopener noreferrer">
            Learn more about Cronos
          </a>
        </p>
        <p style={{ marginTop: '6px' }}>
          Create · Generate · Launch · All rights reserved © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
