// Upload Traits Page - For uploading trait layer images with dynamic layers

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { projectsApi, traitsApi } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import type { Project } from '@/types';

interface TraitLayer {
  id: string;
  name: string;
  uploadedCount: number;
  order: number;
}

export default function UploadTraitsPage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAppKitAccount();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [layers, setLayers] = useState<TraitLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newLayerName, setNewLayerName] = useState('');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState('');
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

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
          if (response.project.wallet_address?.toLowerCase() !== address?.toLowerCase()) {
            setError('You do not have permission to manage this project');
            return;
          }
          setProject(response.project);

          // Fetch existing traits and group by layer
          const traitsResponse = await traitsApi.list(projectId);
          if (traitsResponse.success && traitsResponse.traits) {
            const layerMap = new Map<string, number>();
            traitsResponse.traits.forEach((trait) => {
              const count = layerMap.get(trait.layer_type) || 0;
              layerMap.set(trait.layer_type, count + 1);
            });

            // Get layer order from project or default
            const layerOrder = response.project.layer_order || Array.from(layerMap.keys());

            const loadedLayers: TraitLayer[] = layerOrder.map((layerName, index) => ({
              id: `layer-${index}-${layerName}`,
              name: layerName,
              uploadedCount: layerMap.get(layerName) || 0,
              order: index,
            }));

            setLayers(loadedLayers);
            if (loadedLayers.length > 0) {
              setSelectedLayerId(loadedLayers[0].id);
            }
          }
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

  const handleAddLayer = () => {
    if (!newLayerName.trim()) {
      setError('Please enter a layer name');
      return;
    }

    // Check for duplicate names
    if (layers.some((l) => l.name.toLowerCase() === newLayerName.toLowerCase())) {
      setError('A layer with this name already exists');
      return;
    }

    const newLayer: TraitLayer = {
      id: `layer-${Date.now()}-${newLayerName}`,
      name: newLayerName.trim(),
      uploadedCount: 0,
      order: layers.length,
    };

    setLayers([...layers, newLayer]);
    setNewLayerName('');
    setSelectedLayerId(newLayer.id);
    setError(null);
  };

  const handleRenameLayer = (layerId: string) => {
    if (!editingLayerName.trim()) {
      setError('Layer name cannot be empty');
      return;
    }

    // Check for duplicate names
    if (layers.some((l) => l.id !== layerId && l.name.toLowerCase() === editingLayerName.toLowerCase())) {
      setError('A layer with this name already exists');
      return;
    }

    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, name: editingLayerName.trim() } : layer
      )
    );
    setEditingLayerId(null);
    setEditingLayerName('');
    setError(null);
  };

  const handleDeleteLayer = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer && layer.uploadedCount > 0) {
      if (!confirm(`This layer has ${layer.uploadedCount} uploaded traits. Delete anyway?`)) {
        return;
      }
    }

    const newLayers = layers.filter((l) => l.id !== layerId).map((layer, index) => ({
      ...layer,
      order: index,
    }));
    setLayers(newLayers);

    if (selectedLayerId === layerId) {
      setSelectedLayerId(newLayers.length > 0 ? newLayers[0].id : null);
    }
  };

  const handleDragStart = (layerId: string) => {
    setDraggedLayerId(layerId);
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    if (draggedLayerId === null || draggedLayerId === layerId) return;

    const draggedIndex = layers.findIndex((l) => l.id === draggedLayerId);
    const targetIndex = layers.findIndex((l) => l.id === layerId);

    const newLayers = [...layers];
    const [draggedLayer] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedLayer);

    setLayers(newLayers.map((layer, index) => ({ ...layer, order: index })));
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (!selectedLayerId) {
      setError('Please select a layer first');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    const selectedLayer = layers.find((l) => l.id === selectedLayerId);
    if (!selectedLayer) return;

    setUploading(true);
    setError(null);

    try {
      const response = await traitsApi.upload(projectId, selectedLayer.name, selectedFiles);

      if (response.success) {
        // Update uploaded count
        setLayers(
          layers.map((layer) =>
            layer.id === selectedLayerId
              ? { ...layer, uploadedCount: layer.uploadedCount + selectedFiles.length }
              : layer
          )
        );

        // Clear selection
        setSelectedFiles([]);

        // Update project with layer order
        const layerOrder = layers.map((l) => l.name);
        await projectsApi.update(projectId, { layer_order: layerOrder });

        // Update status if needed
        if (project?.status === 'setup' && layers.every((l) => l.uploadedCount > 0 || l.id === selectedLayerId)) {
          await projectsApi.update(projectId, { status: 'traits_uploaded' });
          setProject((prev) => (prev ? { ...prev, status: 'traits_uploaded' } : null));
        }

        alert(`Successfully uploaded ${selectedFiles.length} traits to ${selectedLayer.name}!`);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload traits');
    } finally {
      setUploading(false);
    }
  };

  const totalTraits = layers.reduce((sum, layer) => sum + layer.uploadedCount, 0);
  const allLayersHaveTraits = layers.length > 0 && layers.every((l) => l.uploadedCount > 0);

  if (!isConnected) {
    return null;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="status-box info">Loading project...</div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="page">
        <div className="status-box error">{error}</div>
        <button onClick={() => router.push('/my-projects')} className="primary-btn">
          Back to My Projects
        </button>
      </div>
    );
  }

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="logo">CRO212HUB</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="wallet-address">{formatAddress(address)}</div>
          <button
            onClick={() => router.push(`/my-projects/${projectId}`)}
            className="secondary-btn"
            style={{ width: 'auto', padding: '4px 12px' }}
          >
            Back to Project
          </button>
        </div>
      </header>

      <h1>Upload Traits - {project?.name}</h1>
      <p className="subtitle">
        Create custom trait layers, upload images, and reorder them by dragging. Each layer will be combined
        to generate unique NFTs.
      </p>

      {/* Progress Summary */}
      <section className="card" style={{ marginBottom: '20px' }}>
        <h2>Upload Progress</h2>
        <div className="layout">
          <div>
            <div className="row">
              <span className="label">Total Traits</span>
              <span className="value" style={{ fontSize: '18px' }}>
                {totalTraits}
              </span>
            </div>
          </div>
          <div>
            <div className="row">
              <span className="label">Layers Created</span>
              <span className="value" style={{ fontSize: '18px' }}>
                {layers.length}
              </span>
            </div>
          </div>
          <div>
            <div className="row">
              <span className="label">Status</span>
              <span className="value">
                <span className={`badge ${allLayersHaveTraits ? 'badge-success' : 'badge-warning'}`}>
                  {allLayersHaveTraits ? 'Ready' : 'In Progress'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {allLayersHaveTraits && (
          <button
            onClick={() => router.push(`/my-projects/${projectId}/generate`)}
            className="primary-btn"
            style={{ marginTop: '12px' }}
          >
            Continue to Generation →
          </button>
        )}
      </section>

      <div className="layout">
        {/* Layer Management */}
        <section className="card" style={{ flex: '1 1 100%' }}>
          <h2>Trait Layers</h2>
          <p className="links">
            Create layers (e.g., Background, Body, Eyes). Drag to reorder - bottom layers render first.
          </p>

          {/* Add New Layer */}
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLayer()}
              placeholder="Enter layer name..."
              style={{ flex: 1 }}
            />
            <button onClick={handleAddLayer} className="secondary-btn" style={{ width: 'auto', marginTop: '0' }}>
              + Add Layer
            </button>
          </div>

          {/* Layer List */}
          {layers.length === 0 ? (
            <div className="status-box warning" style={{ marginTop: '14px' }}>
              No layers yet. Create your first layer to start uploading traits.
            </div>
          ) : (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  draggable
                  onDragStart={() => handleDragStart(layer.id)}
                  onDragOver={(e) => handleDragOver(e, layer.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedLayerId(layer.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: selectedLayerId === layer.id ? '2px solid #6366f1' : '1px solid #4b5563',
                    background: selectedLayerId === layer.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card-secondary)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '18px', cursor: 'grab' }}>⋮⋮</div>

                    {editingLayerId === layer.id ? (
                      <input
                        type="text"
                        value={editingLayerName}
                        onChange={(e) => setEditingLayerName(e.target.value)}
                        onBlur={() => handleRenameLayer(layer.id)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleRenameLayer(layer.id);
                          if (e.key === 'Escape') setEditingLayerId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, fontSize: '14px', padding: '4px 8px' }}
                      />
                    ) : (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{layer.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {layer.uploadedCount} trait{layer.uploadedCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLayerId(layer.id);
                          setEditingLayerName(layer.name);
                        }}
                        className="secondary-btn"
                        style={{ fontSize: '12px', padding: '4px 8px', marginTop: '0', width: 'auto' }}
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        className="secondary-btn"
                        style={{ fontSize: '12px', padding: '4px 8px', marginTop: '0', width: 'auto', borderColor: '#dc2626' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upload Form */}
        <section className="card">
          <h2>Upload Traits</h2>
          {selectedLayer ? (
            <>
              <p className="links">
                Upload images for <strong>{selectedLayer.name}</strong> layer
              </p>

              <div className="row" style={{ marginTop: '12px' }}>
                <span className="label">Current Count</span>
                <span className="value">{selectedLayer.uploadedCount}</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label
                  htmlFor="trait-files"
                  style={{
                    display: 'block',
                    padding: '40px 20px',
                    border: '2px dashed #4b5563',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: selectedFiles.length > 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  }}
                >
                  <input
                    type="file"
                    id="trait-files"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                  {selectedFiles.length > 0 ? (
                    <>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Click to change selection
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        Click to select images
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        PNG, JPG, or GIF (max 10MB each)
                      </div>
                    </>
                  )}
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h3>Selected Files:</h3>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="row"
                        style={{
                          fontSize: '12px',
                          padding: '4px 0',
                          borderBottom: '1px solid var(--border-primary)',
                        }}
                      >
                        <span className="label">{file.name}</span>
                        <span className="value">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="status-box error" style={{ marginTop: '12px' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                className="primary-btn"
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            <div className="status-box warning">
              Please create and select a layer first
            </div>
          )}
        </section>

        {/* Guidelines */}
        <section className="card">
          <h2>Upload Guidelines</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '8px' }}>✅ All images must have the same dimensions</p>
            <p style={{ marginBottom: '8px' }}>✅ Use PNG format with transparent backgrounds</p>
            <p style={{ marginBottom: '8px' }}>✅ Name files descriptively</p>
            <p style={{ marginBottom: '8px' }}>✅ Upload at least 3-5 traits per layer</p>
            <p style={{ marginBottom: '8px' }}>✅ Layers stack from bottom to top</p>
            <p style={{ marginBottom: '0' }}>⚠️ Maximum file size: 10MB per image</p>
          </div>
        </section>
      </div>
    </div>
  );
}
