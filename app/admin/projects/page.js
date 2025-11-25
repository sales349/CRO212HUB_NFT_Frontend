// app/admin/projects/page.js
// Projects List Page - Connected to Backend API

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function ProjectsPage() {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
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
            Connect your Cronos wallet to create and manage NFT projects on CRO212HUB
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
            onClick={() => router.push('/admin')}
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
            ← Back to Dashboard
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <button
              onClick={() => router.push('/admin')}
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
              ← Back to Dashboard
            </button>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              NFT Projects
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '16px'
            }}>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <button
            onClick={() => router.push('/admin/projects/new')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            + Create Project
          </button>
        </div>

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

        {/* Projects Grid */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📁
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              No Projects Yet
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '24px'
            }}>
              Create your first NFT project to get started
            </p>
            <button
              onClick={() => router.push('/admin/projects/new')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/admin/projects/${project.id}`)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Status Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: project.status === 'deployed' ? 'rgba(74, 222, 128, 0.2)' :
                               project.status === 'generated' ? 'rgba(96, 165, 250, 0.2)' :
                               project.status === 'traits_uploaded' ? 'rgba(251, 191, 36, 0.2)' :
                               'rgba(100, 116, 139, 0.2)',
                    color: project.status === 'deployed' ? '#4ade80' :
                           project.status === 'generated' ? '#60a5fa' :
                           project.status === 'traits_uploaded' ? '#fbbf24' :
                           '#94a3b8',
                    textTransform: 'capitalize'
                  }}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Project Info */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {project.name}
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '16px'
                }}>
                  {project.symbol}
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '16px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Supply
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {project.max_supply}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Price
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {project.mint_price} CRO
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '12px'
                }}>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
