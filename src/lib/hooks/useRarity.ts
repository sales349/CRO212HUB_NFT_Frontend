// useRarity Hook - Rarity calculation and statistics management

import { useState, useCallback } from 'react';
import { rarityApi } from '@/lib/api';
import type { RarityStatistics } from '@/types';

export function useRarity(projectId: string) {
  const [statistics, setStatistics] = useState<RarityStatistics | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    try {
      setCalculating(true);
      setError(null);
      setProgress('Calculating rarity scores...');

      const response = await rarityApi.calculate(projectId);

      if (response.success && response.statistics) {
        setStatistics(response.statistics);
        setProgress('Rarity calculated successfully!');
        return response.statistics;
      } else {
        setError(response.error || 'Rarity calculation failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setCalculating(false);
      setTimeout(() => setProgress(''), 3000);
    }
  }, [projectId]);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rarityApi.getStatistics(projectId);

      if (response.success && response.statistics) {
        setStatistics(response.statistics);
      } else {
        setError(response.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const downloadCSV = useCallback(() => {
    const csvUrl = rarityApi.exportCSV(projectId);
    window.open(csvUrl, '_blank');
  }, [projectId]);

  return {
    statistics,
    calculate,
    fetchStatistics,
    downloadCSV,
    calculating,
    loading,
    progress,
    error,
  };
}
