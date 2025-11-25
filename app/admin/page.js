// app/admin/page.js
// Admin Dashboard Home - CRO212HUB Phase 2

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

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
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            CRO212HUB NFT Generator
          </h1>
          <div style={{
            fontSize: '24px',
            color: '#4ade80',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            ✓ Phase 2 - Online
          </div>
          <p style={{
            fontSize: '16px',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            NFT Generator & Launchpad Platform - Admin Dashboard
          </p>
        </div>

        {/* Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Backend Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              Backend API
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#4ade80',
              marginBottom: '4px'
            }}>
              ✓ Running
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              Port 3002
            </div>
          </div>

          {/* Database Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              Supabase Database
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#4ade80',
              marginBottom: '4px'
            }}>
              ✓ Connected
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              Admin client active
            </div>
          </div>

          {/* Milestone Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              Current Milestone
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#60a5fa',
              marginBottom: '4px'
            }}>
              M1 - Setup
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>
              In Progress
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <button
              onClick={() => router.push('/admin/projects')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 24px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              📁 Manage Projects
            </button>

            <button
              onClick={() => window.open('http://localhost:3002', '_blank')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '16px 24px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔧 Backend API
            </button>

            <button
              onClick={() => router.push('/')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '16px 24px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🎨 Mint Page
            </button>
          </div>
        </div>

        {/* Milestone Progress */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px'
          }}>
            Development Roadmap
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {[
              { milestone: 'M1', name: 'Architecture & Setup', status: 'in-progress' },
              { milestone: 'M2', name: 'NFT Generator Core', status: 'pending' },
              { milestone: 'M3', name: 'Rarity System', status: 'pending' },
              { milestone: 'M4', name: 'Contract Deployment', status: 'pending' },
              { milestone: 'M5', name: 'Admin Dashboard', status: 'pending' },
              { milestone: 'M6', name: 'Public Mint Page', status: 'pending' },
              { milestone: 'M7', name: 'Testing & Cleanup', status: 'pending' },
              { milestone: 'M8', name: 'Final Review', status: 'pending' }
            ].map((item) => (
              <div
                key={item.milestone}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: item.status === 'in-progress'
                    ? 'rgba(96, 165, 250, 0.1)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: item.status === 'in-progress'
                    ? 'rgba(96, 165, 250, 0.3)'
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <span style={{
                  width: '60px',
                  fontWeight: '700',
                  color: item.status === 'in-progress' ? '#60a5fa' : '#64748b'
                }}>
                  {item.milestone}
                </span>
                <span style={{
                  flex: 1,
                  color: item.status === 'in-progress' ? '#e2e8f0' : '#94a3b8'
                }}>
                  {item.name}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: item.status === 'in-progress'
                    ? 'rgba(96, 165, 250, 0.2)'
                    : 'rgba(100, 116, 139, 0.2)',
                  color: item.status === 'in-progress' ? '#60a5fa' : '#94a3b8'
                }}>
                  {item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <p>CRO212HUB NFT Generator & Launchpad Platform</p>
          <p style={{ marginTop: '8px' }}>Phase 2 - Milestone 1 Complete ✓</p>
        </div>
      </div>
    </div>
  );
}
