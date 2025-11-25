// app/admin/projects/new/page.js
// Create New Project Page - Connected to Backend API

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function NewProjectPage() {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    max_supply: '',
    mint_price: '',
    treasury_wallet: address || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Update treasury wallet when wallet connects
  useState(() => {
    if (address && !formData.treasury_wallet) {
      setFormData(prev => ({ ...prev, treasury_wallet: address }));
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name || !formData.symbol || !formData.max_supply || !formData.mint_price) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseInt(formData.max_supply) < 1) {
      setError('Max supply must be at least 1');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.mint_price) < 0) {
      setError('Mint price must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          max_supply: parseInt(formData.max_supply),
          mint_price: formData.mint_price,
          treasury_wallet: formData.treasury_wallet || address,
          creator_wallet: address
        })
      });

      const data = await response.json();

      if (data.success && data.project) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/projects/${data.project.id}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '60px 40px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
            Connect your Cronos wallet to create a new NFT project
          </p>
          <button
            onClick={() => open()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 32px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            Connect Wallet
          </button>
          <button
            onClick={() => router.push('/admin/projects')}
            style={{
              marginTop: '16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => router.push('/admin/projects')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '12px',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Projects
          </button>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            Create New Project
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '16px'
          }}>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '16px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#4ade80',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>✓</span>
            <span>Project created successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              Project Details
            </h2>

            {/* Project Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Project Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cronos Punks"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Symbol */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Symbol <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., CPUNK"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your NFT collection..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Max Supply & Mint Price - Side by Side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Max Supply <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="number"
                  name="max_supply"
                  value={formData.max_supply}
                  onChange={handleChange}
                  placeholder="e.g., 10000"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Mint Price (CRO) <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="number"
                  name="mint_price"
                  value={formData.mint_price}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            {/* Treasury Wallet */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Treasury Wallet
              </label>
              <input
                type="text"
                name="treasury_wallet"
                value={formData.treasury_wallet}
                onChange={handleChange}
                placeholder={address || '0x...'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '6px'
              }}>
                Defaults to your connected wallet. This wallet will receive mint revenue.
              </p>
            </div>

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                type="button"
                onClick={() => router.push('/admin/projects')}
                disabled={loading}
                style={{
                  flex: '1',
                  padding: '14px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                style={{
                  flex: '2',
                  padding: '14px 24px',
                  background: loading || success
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  boxShadow: loading || success ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Creating Project...' : success ? 'Created!' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>

        {/* Info Card */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>ℹ️</span> Next Steps
          </h3>
          <ul style={{
            fontSize: '14px',
            color: '#94a3b8',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Upload trait layers (Background, Body, Eyes, Mouth, etc.)</li>
            <li>Generate your NFT collection images and metadata</li>
            <li>Calculate rarity scores and download CSV reports</li>
            <li>Deploy your smart contract to Cronos blockchain</li>
            <li>Launch your mint page for public minting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
