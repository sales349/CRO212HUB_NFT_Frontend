// useGeneration Hook - NFT generation management

import { useState, useCallback } from 'react';
import { generationApi } from '@/lib/api';
import type { GenerationRequest, TokenRarity } from '@/types';

export function useGeneration(projectId: string) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: GenerationRequest) => {
      try {
        setGenerating(true);
        setError(null);
        setProgress('Starting generation...');

        const response = await generationApi.generate(projectId, params);

        if (response.success) {
          setProgress(
            `Generating ${response.tokenCount} NFTs... This may take a few minutes.`
          );
          return true;
        } else {
          setError(response.error || 'Generation failed');
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      } finally {
        // Keep generating state until status is checked
        setTimeout(() => {
          setGenerating(false);
          setProgress('');
        }, 5000);
      }
    },
    [projectId]
  );

  const checkStatus = useCallback(async () => {
    try {
      const response = await generationApi.getStatus(projectId);

      if (response.success && response.status) {
        const progressPercentage = response.status.progress || 0;
        setProgress(`Generation progress: ${progressPercentage}%`);

        if (response.status.status === 'completed') {
          setGenerating(false);
          setProgress('Generation complete!');
          return 'completed';
        } else if (response.status.status === 'failed') {
          setGenerating(false);
          setError(response.status.error || 'Generation failed');
          return 'failed';
        }

        return response.status.status;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
    return null;
  }, [projectId]);

  return {
    generate,
    checkStatus,
    generating,
    progress,
    error,
  };
}

export function useTokens(projectId: string | null, limit: number = 50) {
  const [tokens, setTokens] = useState<TokenRarity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(
    async (offset: number = 0) => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await generationApi.getTokens(projectId, { limit, offset });

        if (response.success) {
          setTokens(response.tokens);
          setTotal(response.total);
        } else {
          setError(response.error || 'Failed to fetch tokens');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [projectId, limit]
  );

  return {
    tokens,
    total,
    loading,
    error,
    fetchTokens,
  };
}
