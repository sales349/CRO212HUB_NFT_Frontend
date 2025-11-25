// app/admin/projects/[id]/page.js
// Project Detail Page - Complete Project Management

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const LAYER_TYPES = ['Background', 'Body', 'Eyes', 'Mouth', 'Clothes', 'Accessories'];

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [traits, setTraits] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [rarityStats, setRarityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [selectedLayer, setSelectedLayer] = useState('Background');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // Rarity state
  const [calculatingRarity, setCalculatingRarity] = useState(false);
  const [rarityProgress, setRarityProgress] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isConnected && projectId) {
      fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [isConnected, projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch project
      const projectRes = await fetch(`${API_URL}/api/projects/${projectId}`);
      const projectData = await projectRes.json();

      if (projectData.success) {
        setProject(projectData.project);
      }

      // Fetch traits
      const traitsRes = await fetch(`${API_URL}/api/projects/${projectId}/traits`);
      const traitsData = await traitsRes.json();

      if (traitsData.success) {
        setTraits(traitsData.traits);
      }

      // Fetch tokens if generated
      if (projectData.project?.status === 'generated' || projectData.project?.status === 'deployed') {
        const tokensRes = await fetch(`${API_URL}/api/generate/${projectId}/tokens?limit=50`);
        const tokensData = await tokensRes.json();

        if (tokensData.success) {
          setTokens(tokensData.tokens);
        }

        // Fetch rarity stats
        const rarityRes = await fetch(`${API_URL}/api/rarity/${projectId}/statistics`);
        const rarityData = await rarityRes.json();

        if (rarityData.success) {
          setRarityStats(rarityData.statistics);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const handleUploadTraits = async () => {
    if (uploadFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading ${uploadFiles.length} traits...`);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('layerType', selectedLayer);

      uploadFiles.forEach(file => {
        formData.append('traits', file);
      });

      const response = await fetch(`${API_URL}/api/projects/${projectId}/traits`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(`Successfully uploaded ${uploadFiles.length} traits!`);
        setUploadFiles([]);

        // Refresh traits
        await fetchProjectData();

        setTimeout(() => {
          setUploadProgress('');
        }, 3000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload traits');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateCollection = async () => {
    if (!project) return;

    setGenerating(true);
    setGenerationProgress('Starting generation...');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/generate/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count: project.max_supply
        })
      });

      const data = await response.json();

      if (data.success) {
        setGenerationProgress(`Generating ${data.tokenCount} NFTs... This may take a few minutes.`);

        // Poll for completion
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/generate/${projectId}/status`);
          const statusData = await statusRes.json();

          if (statusData.success) {
            const progress = statusData.project.progress_percentage;
            setGenerationProgress(`Generation progress: ${progress}%`);

            if (statusData.project.status === 'generated') {
              clearInterval(pollInterval);
              setGenerationProgress('Generation complete!');
              await fetchProjectData();

              setTimeout(() => {
                setGenerating(false);
                setGenerationProgress('');
              }, 3000);
            }
          }
        }, 3000);

        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setGenerating(false);
          setGenerationProgress('');
        }, 600000);
      } else {
        setError(data.error || 'Generation failed');
        setGenerating(false);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to start generation');
      setGenerating(false);
    }
  };

  const handleCalculateRarity = async () => {
    setCalculatingRarity(true);
    setRarityProgress('Calculating rarity scores...');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/rarity/${projectId}/calculate`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setRarityProgress('Rarity calculated successfully!');
        await fetchProjectData();

        setTimeout(() => {
          setCalculatingRarity(false);
          setRarityProgress('');
        }, 3000);
      } else {
        setError(data.error || 'Rarity calculation failed');
        setCalculatingRarity(false);
      }
    } catch (err) {
      console.error('Rarity calculation error:', err);
      setError('Failed to calculate rarity');
      setCalculatingRarity(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      window.open(`${API_URL}/api/rarity/${projectId}/export-csv`, '_blank');
    } catch (err) {
      console.error('CSV download error:', err);
      setError('Failed to download CSV');
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
            Connect your Cronos wallet to manage this project
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
        </div>
      </div>
    );
  }

  if (loading) {
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#94a3b8' }}>Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!project) {
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Project Not Found</h2>
          <button
            onClick={() => router.push('/admin/projects')}
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
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Group traits by layer type
  const traitsByLayer = LAYER_TYPES.reduce((acc, layer) => {
    acc[layer] = traits.filter(t => t.layer_type === layer);
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
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

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '700' }}>
                  {project.name}
                </h1>
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
                         project.status === 'traits_uploaded' ? '#fbbf24' : '#94a3b8',
                  textTransform: 'capitalize'
                }}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                {project.symbol} • Max Supply: {project.max_supply} • Price: {project.mint_price} CRO
              </p>
            </div>
          </div>
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

        {/* Progress Messages */}
        {(uploadProgress || generationProgress || rarityProgress) && (
          <div style={{
            padding: '16px',
            background: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#60a5fa'
          }}>
            {uploadProgress || generationProgress || rarityProgress}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflowX: 'auto'
        }}>
          {['overview', 'traits', 'generate', 'gallery'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                color: activeTab === tab ? '#fff' : '#94a3b8',
                fontSize: '16px',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Project Stats */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Project Stats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Traits Uploaded
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {traits.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    NFTs Generated
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    {tokens.length} / {project.max_supply}
                  </div>
                </div>
                {rarityStats?.calculated && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Rarity Calculated
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#4ade80' }}>
                      ✓
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('traits')}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📁 Upload Traits
                </button>
                <button
                  onClick={handleGenerateCollection}
                  disabled={generating || traits.length === 0 || project.status === 'generated'}
                  style={{
                    padding: '12px 16px',
                    background: generating || traits.length === 0 || project.status === 'generated'
                      ? 'rgba(96, 165, 250, 0.05)'
                      : 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '8px',
                    color: generating || traits.length === 0 || project.status === 'generated'
                      ? '#64748b'
                      : '#60a5fa',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: generating || traits.length === 0 || project.status === 'generated'
                      ? 'not-allowed'
                      : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🎨 Generate Collection
                </button>
                <button
                  onClick={handleCalculateRarity}
                  disabled={calculatingRarity || tokens.length === 0}
                  style={{
                    padding: '12px 16px',
                    background: calculatingRarity || tokens.length === 0
                      ? 'rgba(251, 191, 36, 0.05)'
                      : 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    color: calculatingRarity || tokens.length === 0 ? '#64748b' : '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: calculatingRarity || tokens.length === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📊 Calculate Rarity
                </button>
                <button
                  onClick={handleDownloadCSV}
                  disabled={!rarityStats?.calculated}
                  style={{
                    padding: '12px 16px',
                    background: !rarityStats?.calculated
                      ? 'rgba(74, 222, 128, 0.05)'
                      : 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '8px',
                    color: !rarityStats?.calculated ? '#64748b' : '#4ade80',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: !rarityStats?.calculated ? 'not-allowed' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📥 Download CSV
                </button>
              </div>
            </div>

            {/* Rarity Stats */}
            {rarityStats?.calculated && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Rarity Statistics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Min Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>
                      {rarityStats.scores.min}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Max Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>
                      {rarityStats.scores.max}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Mean Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>
                      {rarityStats.scores.mean}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'traits' && (
          <div>
            {/* Upload Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                Upload Traits
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Select Layer Type
                </label>
                <select
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  {LAYER_TYPES.map(layer => (
                    <option key={layer} value={layer}>{layer}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Select PNG Files
                </label>
                <input
                  type="file"
                  accept=".png"
                  multiple
                  onChange={handleFileSelect}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
                {uploadFiles.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                    {uploadFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <button
                onClick={handleUploadTraits}
                disabled={uploading || uploadFiles.length === 0}
                style={{
                  padding: '12px 24px',
                  background: uploading || uploadFiles.length === 0
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: uploading || uploadFiles.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: uploading || uploadFiles.length === 0 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Traits'}
              </button>
            </div>

            {/* Traits Grid by Layer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {LAYER_TYPES.map(layer => (
                <div
                  key={layer}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {layer}
                    <span style={{
                      fontSize: '14px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(102, 126, 234, 0.2)',
                      color: '#667eea',
                      fontWeight: '500'
                    }}>
                      {traitsByLayer[layer].length} traits
                    </span>
                  </h3>

                  {traitsByLayer[layer].length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                      No traits uploaded for this layer yet
                    </p>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '12px'
                    }}>
                      {traitsByLayer[layer].map(trait => (
                        <div
                          key={trait.id}
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px'
                          }}>
                            🖼️
                          </div>
                          <p style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            wordBreak: 'break-word'
                          }}>
                            {trait.trait_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎨</div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
              Generate NFT Collection
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 32px' }}>
              This will generate {project.max_supply} unique NFTs using your uploaded traits.
              Each NFT will have randomly selected traits from each layer.
            </p>

            {project.status === 'generated' ? (
              <div>
                <div style={{
                  padding: '16px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  color: '#4ade80',
                  display: 'inline-block'
                }}>
                  ✓ Collection already generated ({tokens.length} NFTs)
                </div>
                <br />
                <button
                  onClick={() => setActiveTab('gallery')}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  View Gallery
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCollection}
                disabled={generating || traits.length === 0}
                style={{
                  padding: '16px 48px',
                  background: generating || traits.length === 0
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: generating || traits.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: generating || traits.length === 0 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                {generating ? 'Generating...' : traits.length === 0 ? 'Upload Traits First' : 'Start Generation'}
              </button>
            )}

            {traits.length === 0 && (
              <p style={{ color: '#f87171', marginTop: '16px', fontSize: '14px' }}>
                Please upload traits before generating the collection
              </p>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            {tokens.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                  No NFTs Generated Yet
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                  Generate your collection to see the NFT gallery
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Go to Generate
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
                    Generated NFTs ({tokens.length})
                  </h2>
                  {rarityStats?.calculated && (
                    <button
                      onClick={handleDownloadCSV}
                      style={{
                        padding: '10px 20px',
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        borderRadius: '8px',
                        color: '#4ade80',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📥 Download CSV
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {tokens.map(token => (
                    <div
                      key={token.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        aspectRatio: '1',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px'
                      }}>
                        🖼️
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                          #{token.token_id}
                        </h4>
                        {token.rarity_rank && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            background: 'rgba(251, 191, 36, 0.2)',
                            color: '#fbbf24'
                          }}>
                            Rank #{token.rarity_rank}
                          </span>
                        )}
                      </div>
                      {token.rarity_score && (
                        <p style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '8px'
                        }}>
                          Score: {token.rarity_score}
                        </p>
                      )}
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {token.attributes?.length || 0} traits
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
