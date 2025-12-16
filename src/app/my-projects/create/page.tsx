// Create Project Page - Form for creating new NFT project

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { projectsApi } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import type { ProjectFormData } from '@/types';

export default function CreateProjectPage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    symbol: '',
    description: '',
    max_supply: 100,
    mint_price: '0.1',
    wallet_address: '',
    treasury_address: '',
    revenue_split: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (address) {
      setFormData((prev) => ({ ...prev, wallet_address: address }));
    }
  }, [isConnected, address, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'max_supply' || name === 'revenue_split' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.symbol) {
        throw new Error('Project name and symbol are required');
      }

      if (formData.max_supply < 1 || formData.max_supply > 10000) {
        throw new Error('Max supply must be between 1 and 10,000');
      }

      if (parseFloat(formData.mint_price) < 0) {
        throw new Error('Mint price must be 0 or greater');
      }

      if (formData.revenue_split < 0 || formData.revenue_split > 100) {
        throw new Error('Revenue split must be between 0 and 100');
      }

      const response = await projectsApi.create(formData);

      if (response.success && response.project) {
        // Redirect to the new project page
        router.push(`/my-projects/${response.project.id}`);
      } else {
        throw new Error(response.error || 'Failed to create project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => router.push('/my-projects')}
            className="secondary-btn"
            style={{ width: 'auto', padding: '4px 12px' }}
          >
            Back to Projects
          </button>
        </div>
      </header>

      <h1>Create New NFT Project</h1>
      <p className="subtitle">
        Fill in the details for your NFT collection. You'll be able to upload traits and generate
        artwork after creating the project.
      </p>

      {error && (
        <div className="status-box error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="layout" style={{ alignItems: 'stretch' }}>
          {/* Basic Information */}
          <section className="card" style={{ flex: '1 1 100%' }}>
            <h2>Basic Information</h2>

            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                Project Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cool Cats Collection"
                required
                maxLength={100}
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                The name of your NFT collection
              </p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="symbol" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                Symbol <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., COOL"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Short symbol for your collection (2-10 characters)
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your NFT collection..."
                rows={4}
                maxLength={500}
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Optional description for your collection (max 500 characters)
              </p>
            </div>
          </section>

          {/* Collection Settings */}
          <section className="card">
            <h2>Collection Settings</h2>

            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="max_supply"
                style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}
              >
                Max Supply <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                id="max_supply"
                name="max_supply"
                value={formData.max_supply}
                onChange={handleChange}
                min="1"
                max="10000"
                required
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Total number of NFTs (1-10,000)
              </p>
            </div>

            <div>
              <label
                htmlFor="mint_price"
                style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}
              >
                Mint Price (CRO) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                id="mint_price"
                name="mint_price"
                value={formData.mint_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Price per NFT in CRO tokens
              </p>
            </div>
          </section>

          {/* Revenue Settings */}
          <section className="card">
            <h2>Revenue Settings</h2>

            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="treasury_address"
                style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}
              >
                Treasury Address
              </label>
              <input
                type="text"
                id="treasury_address"
                name="treasury_address"
                value={formData.treasury_address}
                onChange={handleChange}
                placeholder="0x..."
                pattern="^0x[a-fA-F0-9]{40}$"
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Optional separate wallet for receiving revenue
              </p>
            </div>

            <div>
              <label
                htmlFor="revenue_split"
                style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}
              >
                Revenue Split (%)
              </label>
              <input
                type="number"
                id="revenue_split"
                name="revenue_split"
                value={formData.revenue_split}
                onChange={handleChange}
                min="0"
                max="100"
              />
              <p className="links" style={{ marginTop: '4px', marginBottom: '0' }}>
                Percentage to send to treasury (0-100%)
              </p>
            </div>
          </section>

          {/* Connected Wallet Info */}
          <section className="card" style={{ flex: '1 1 100%' }}>
            <h2>Owner Wallet</h2>
            <div className="row">
              <span className="label">Connected Address</span>
              <div className="wallet-address" style={{ marginBottom: '0' }}>
                {formatAddress(address)}
              </div>
            </div>
            <p className="links" style={{ marginTop: '10px' }}>
              This wallet will be set as the project owner and contract deployer. Make sure you have
              enough CRO for deployment fees.
            </p>
          </section>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '24px' }}>
          <button type="submit" className="primary-btn" disabled={loading} style={{ maxWidth: '400px' }}>
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/my-projects')}
            className="secondary-btn"
            disabled={loading}
            style={{ maxWidth: '400px' }}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="links">
        <p>
          After creating your project, you'll be able to upload trait layers and generate your NFT
          collection.
        </p>
      </div>
    </div>
  );
}
