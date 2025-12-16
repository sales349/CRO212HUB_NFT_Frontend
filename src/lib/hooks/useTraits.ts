// useTraits Hook - Trait data fetching and upload management

import { useState, useEffect, useCallback } from 'react';
import { traitsApi } from '@/lib/api';
import type { Trait, LayerType, TraitsByLayer } from '@/types';

export function useTraits(projectId: string | null) {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [traitsByLayer, setTraitsByLayer] = useState<TraitsByLayer>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTraits = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await traitsApi.list(projectId);

      if (response.success) {
        setTraits(response.traits);

        // Group traits by layer
        const grouped = response.traits.reduce<TraitsByLayer>((acc, trait) => {
          if (!acc[trait.layer_type]) {
            acc[trait.layer_type] = [];
          }
          acc[trait.layer_type].push(trait);
          return acc;
        }, {});

        setTraitsByLayer(grouped);
      } else {
        setError(response.error || 'Failed to fetch traits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTraits();
  }, [fetchTraits]);

  return {
    traits,
    traitsByLayer,
    loading,
    error,
    refetch: fetchTraits,
  };
}

export function useUploadTraits(projectId: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const uploadTraits = useCallback(
    async (layerType: LayerType, files: File[]) => {
      try {
        setUploading(true);
        setError(null);
        setProgress(`Uploading ${files.length} traits...`);

        const response = await traitsApi.upload(projectId, layerType, files);

        if (response.success) {
          setProgress(
            `Successfully uploaded ${response.uploaded_count || files.length} traits!`
          );
          return response.traits || [];
        } else {
          setError(response.error || 'Upload failed');
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      } finally {
        setUploading(false);
        // Clear progress message after 3 seconds
        setTimeout(() => setProgress(''), 3000);
      }
    },
    [projectId]
  );

  return {
    uploadTraits,
    uploading,
    error,
    progress,
  };
}
