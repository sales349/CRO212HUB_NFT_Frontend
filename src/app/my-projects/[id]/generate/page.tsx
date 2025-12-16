'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from '@/lib/api/projects';
import { traitsApi } from '@/lib/api/traits';
import { generationApi } from '@/lib/api/generation';
import type { Project, Trait } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

type GenerationStep = 'configure' | 'generating' | 'complete';

export default function GeneratePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generation state
  const [currentStep, setCurrentStep] = useState<GenerationStep>('configure');
  const [rarityConfig, setRarityConfig] = useState<Record<string, Record<string, number>>>({});
  const [configMode, setConfigMode] = useState<'manual' | 'csv'>('manual');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTokens, setGeneratedTokens] = useState<any[]>([]);

  // Fetch project and traits
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch project
        const projectResponse = await projectsApi.getById(resolvedParams.id);
        if (!projectResponse.success || !projectResponse.project) {
          throw new Error(projectResponse.error || 'Project not found');
        }
        setProject(projectResponse.project);

        // Fetch traits
        const traitsResponse = await traitsApi.list(resolvedParams.id);
        if (!traitsResponse.success) {
          throw new Error(traitsResponse.error || 'Failed to load traits');
        }
        setTraits(traitsResponse.traits || []);

        // Load existing rarity config if any
        const rarityResponse = await generationApi.getRarityConfig(resolvedParams.id);
        if (rarityResponse.success && rarityResponse.data?.rarity_config) {
          setRarityConfig(rarityResponse.data.rarity_config);
        } else {
          // Initialize with default equal weights
          initializeDefaultWeights(traitsResponse.traits || []);
        }

        // Check if already generated
        if (projectResponse.project.status === 'generated') {
          setCurrentStep('complete');
          loadGeneratedTokens();
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id]);

  // Initialize default equal weights for all traits
  const initializeDefaultWeights = (allTraits: Trait[]) => {
    const config: Record<string, Record<string, number>> = {};

    // Group traits by layer
    const traitsByLayer: Record<string, Trait[]> = {};
    allTraits.forEach((trait) => {
      if (!traitsByLayer[trait.layer_type]) {
        traitsByLayer[trait.layer_type] = [];
      }
      traitsByLayer[trait.layer_type].push(trait);
    });

    // Calculate equal weights per layer
    Object.entries(traitsByLayer).forEach(([layerType, layerTraits]) => {
      config[layerType] = {};
      const defaultWeight = Math.round(100 / layerTraits.length);

      layerTraits.forEach((trait, index) => {
        // Adjust last trait to ensure sum = 100
        const weight =
          index === layerTraits.length - 1
            ? 100 - defaultWeight * (layerTraits.length - 1)
            : defaultWeight;
        config[layerType][trait.trait_name] = weight;
      });
    });

    setRarityConfig(config);
  };

  // Load generated tokens
  const loadGeneratedTokens = async () => {
    try {
      const response = await generationApi.getTokens(resolvedParams.id, { limit: 50 });
      if (response.success && response.tokens) {
        setGeneratedTokens(response.tokens);
      }
    } catch (err) {
      console.error('Failed to load generated tokens:', err);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    generationApi.downloadRarityTemplate(resolvedParams.id);
  };

  // Save rarity configuration
  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const response = await generationApi.saveRarityConfig(resolvedParams.id, rarityConfig);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save configuration');
      }

      alert('Rarity configuration saved successfully!');
      setSaving(false);
    } catch (err: any) {
      alert(err.message);
      setSaving(false);
    }
  };

  // Start generation
  const handleStartGeneration = async () => {
    try {
      setGenerating(true);
      setCurrentStep('generating');

      const response = await generationApi.generate(resolvedParams.id, {});

      if (!response.success) {
        throw new Error(response.error || 'Failed to start generation');
      }

      // Start polling for status
      pollGenerationStatus();
    } catch (err: any) {
      alert(err.message);
      setGenerating(false);
      setCurrentStep('configure');
    }
  };

  // Poll generation status
  const pollGenerationStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await generationApi.getStatus(resolvedParams.id);
        console.log('📊 Poll response:', response);

        if (response.success && response.status) {
          const { progress_percentage, status, generated_count } = response.status;
          console.log(`Progress: ${progress_percentage}%, Status: ${status}, Count: ${generated_count}`);

          setProgress(progress_percentage);

          // Fetch latest generated tokens in real-time
          if (generated_count > 0) {
            const tokensResponse = await generationApi.getTokens(resolvedParams.id, {
              limit: generated_count,
            });
            if (tokensResponse.success && tokensResponse.tokens) {
              console.log(`✅ Fetched ${tokensResponse.tokens.length} tokens`);
              setGeneratedTokens(tokensResponse.tokens);
            }
          }

          if (status === 'generated') {
            console.log('🎉 Generation complete!');
            clearInterval(pollInterval);
            setGenerating(false);
            setCurrentStep('complete');
            loadGeneratedTokens();

            // Refresh project data
            const projectResponse = await projectsApi.getById(resolvedParams.id);
            if (projectResponse.success && projectResponse.project) {
              setProject(projectResponse.project);
            }
          }
        } else {
          console.warn('❌ Invalid response:', response);
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  };

  // Download collection
  const handleDownloadCollection = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${API_URL}/api/generate/${resolvedParams.id}/download`;
    window.open(url, '_blank');
  };

  // Update weight for a specific trait
  const handleWeightChange = (layerType: string, traitName: string, newWeight: number) => {
    setRarityConfig((prev) => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        [traitName]: Math.max(0, newWeight),
      },
    }));
  };

  // Group traits by layer
  const traitsByLayer: Record<string, Trait[]> = {};
  traits.forEach((trait) => {
    if (!traitsByLayer[trait.layer_type]) {
      traitsByLayer[trait.layer_type] = [];
    }
    traitsByLayer[trait.layer_type].push(trait);
  });

  const layerNames = Object.keys(traitsByLayer).sort();

  if (loading) {
    return (
      <div className="page">
        <div className="status-box info" style={{ textAlign: 'center', marginTop: '60px' }}>
          Loading project...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="status-box error" style={{ marginTop: '60px' }}>
          {error}
        </div>
        <button onClick={() => router.push('/my-projects')} className="secondary-btn">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="logo">CRO212HUB</div>
        <button
          onClick={() => router.push(`/my-projects/${resolvedParams.id}/upload-traits`)}
          className="secondary-btn"
          style={{ width: 'auto', padding: '4px 12px' }}
        >
          ← Back to Upload Traits
        </button>
      </div>

      <h1>Generate NFT Collection</h1>
      <p className="subtitle">{project.name} - Configure trait rarity and generate your collection</p>

      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                background:
                  currentStep === 'configure'
                    ? 'linear-gradient(90deg, #6366f1, #ec4899)'
                    : currentStep === 'generating' || currentStep === 'complete'
                    ? '#22c55e'
                    : '#374151',
                color: '#fff',
              }}
            >
              1
            </div>
            <span style={{ fontSize: '13px' }}>Configure</span>
          </div>

          <div style={{ width: '40px', height: '2px', background: '#374151' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                background:
                  currentStep === 'generating'
                    ? 'linear-gradient(90deg, #6366f1, #ec4899)'
                    : currentStep === 'complete'
                    ? '#22c55e'
                    : '#374151',
                color: '#fff',
              }}
            >
              2
            </div>
            <span style={{ fontSize: '13px' }}>Generate</span>
          </div>

          <div style={{ width: '40px', height: '2px', background: '#374151' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                background: currentStep === 'complete' ? '#22c55e' : '#374151',
                color: '#fff',
              }}
            >
              3
            </div>
            <span style={{ fontSize: '13px' }}>Complete</span>
          </div>
        </div>
      </div>

      {/* Step 1: Configure Rarity */}
      {currentStep === 'configure' && (
        <div>
          <section className="card">
            <h2>Rarity Configuration</h2>
            <p className="subtitle" style={{ marginBottom: '16px' }}>
              Configure trait rarity weights to control how often each trait appears. Higher weights mean
              traits will appear more frequently.
            </p>

            {/* Mode Selection */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
              <button
                onClick={() => setConfigMode('manual')}
                className={configMode === 'manual' ? 'primary-btn' : 'secondary-btn'}
                style={{ width: 'auto', padding: '8px 20px' }}
              >
                Manual Setup
              </button>
              <button
                onClick={() => setConfigMode('csv')}
                className={configMode === 'csv' ? 'primary-btn' : 'secondary-btn'}
                style={{ width: 'auto', padding: '8px 20px' }}
              >
                CSV Upload
              </button>
            </div>

            {/* CSV Upload Mode */}
            {configMode === 'csv' && (
              <div>
                <button
                  onClick={handleDownloadTemplate}
                  className="secondary-btn"
                  style={{ width: 'auto', padding: '8px 16px', marginTop: '0' }}
                >
                  📥 Download Sample CSV Template
                </button>

                <div className="status-box info" style={{ marginTop: '12px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '4px' }}>CSV upload functionality coming soon</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0' }}>
                    For now, please download the template, fill it out, and use manual setup
                  </p>
                </div>
              </div>
            )}

            {/* Manual Setup Mode */}
            {configMode === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {layerNames.map((layerType) => {
                  const layerTraits = traitsByLayer[layerType];
                  const totalWeight = Object.values(rarityConfig[layerType] || {}).reduce(
                    (sum, w) => sum + w,
                    0
                  );

                  return (
                    <div
                      key={layerType}
                      style={{
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '14px',
                        background: '#020617',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ marginTop: '0', marginBottom: '0' }}>{layerType}</h3>
                        <span style={{ fontSize: '13px', color: totalWeight === 100 ? '#4ade80' : '#fde68a' }}>
                          Total: {totalWeight}%
                        </span>
                      </div>

                      <div className="grid-2">
                        {layerTraits.map((trait) => (
                          <div
                            key={trait.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <label style={{ flex: '1', fontSize: '13px', color: '#d1d5db' }}>
                              {trait.trait_name}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={rarityConfig[layerType]?.[trait.trait_name] || 0}
                              onChange={(e) =>
                                handleWeightChange(
                                  layerType,
                                  trait.trait_name,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{ width: '70px', padding: '6px 8px', fontSize: '13px' }}
                            />
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              <button onClick={handleSaveConfig} disabled={saving} className="primary-btn" style={{ width: 'auto' }}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>

              <button
                onClick={handleStartGeneration}
                disabled={generating}
                className="primary-btn"
                style={{ width: 'auto', background: '#22c55e' }}
              >
                Start Generation
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Step 2: Generating */}
      {currentStep === 'generating' && (
        <div>
          <section className="card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', marginBottom: '20px' }}>
              <div
                className="loading"
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #374151',
                  borderTopColor: '#6366f1',
                  borderRadius: '50%',
                }}
              ></div>
            </div>
            <h2>Generating Your NFT Collection</h2>
            <p className="subtitle" style={{ textAlign: 'center' }}>
              Please wait while we generate {project.max_supply} unique NFTs...
            </p>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto 12px',
                height: '12px',
                background: '#020617',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '1px solid #374151',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>

            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{progress}% Complete</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '0' }}>
              Generating NFT {generatedTokens.length} of {project.max_supply}
            </p>
          </section>

          {/* Real-time Generated NFTs Preview */}
          {generatedTokens.length > 0 && (
            <section className="card" style={{ marginTop: '16px' }}>
              <h3>Generated NFTs ({generatedTokens.length})</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                {generatedTokens.slice(-20).reverse().map((token) => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                  const imageUrl = `${API_URL}/${token.image_path}`;

                  return (
                    <div
                      key={token.id}
                      className="fade-in"
                      style={{
                        background: '#020617',
                        borderRadius: '8px',
                        padding: '8px',
                        border: '1px solid #374151',
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`Token #${token.token_id}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          marginBottom: '6px',
                          background: '#111827',
                        }}
                      />
                      <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginBottom: '0' }}>
                        #{token.token_id}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Step 3: Complete */}
      {currentStep === 'complete' && (
        <div>
          <section className="card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                background: '#22c55e',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg
                style={{ width: '48px', height: '48px', color: '#fff' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2>Generation Complete!</h2>
            <p className="subtitle" style={{ textAlign: 'center' }}>
              Successfully generated {generatedTokens.length} unique NFTs
            </p>

            {/* Generated Tokens Grid */}
            {generatedTokens.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3>Generated NFTs ({generatedTokens.length} Total)</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px',
                    marginTop: '12px',
                  }}
                >
                  {generatedTokens.slice(0, 20).map((token) => {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                    const imageUrl = `${API_URL}/${token.image_path}`;

                    return (
                      <div
                        key={token.id}
                        style={{
                          background: '#020617',
                          borderRadius: '8px',
                          padding: '8px',
                          border: '1px solid #374151',
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Token #${token.token_id}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            marginBottom: '6px',
                            background: '#111827',
                          }}
                        />
                        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginBottom: '0' }}>
                          #{token.token_id}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadCollection}
                className="primary-btn"
                style={{ width: 'auto', background: '#22c55e' }}
              >
                📥 Download Collection (ZIP)
              </button>
              <button
                onClick={() => router.push(`/my-projects/${resolvedParams.id}`)}
                className="primary-btn"
                style={{ width: 'auto' }}
              >
                View Project Details
              </button>
              <button onClick={() => router.push('/my-projects')} className="secondary-btn" style={{ width: 'auto' }}>
                Back to Projects
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
