'use client';

import { useState, useCallback } from 'react';
import type { Profile, RecommendationResult } from '@/Typescript-Integration/types';

interface UseRecommendationOptions {
  profile: Profile;
  onRecommendationReceived?: (result: RecommendationResult) => void;
}

export function useRecommendation({ profile, onRecommendationReceived }: UseRecommendationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<RecommendationResult | null>(null);

  /**
   * Analyzes conversation transcript and gets wellness recommendations
   */
  const getRecommendation = useCallback(async (
    transcript: string,
    anonymousToken?: string
  ): Promise<RecommendationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          profile,
          anonymousToken
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      const result = data.data as RecommendationResult;
      setLastRecommendation(result);
      
      if (onRecommendationReceived) {
        onRecommendationReceived(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error getting recommendation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile, onRecommendationReceived]);

  /**
   * Detects if a message contains emotional distress keywords
   * Returns true if recommendation should be triggered
   */
  const shouldTriggerRecommendation = useCallback((message: string): boolean => {
    const distressKeywords = [
      // Muerte familiar
      'murió', 'falleció', 'muerte', 'duelo', 'funeral', 'perdí',
      // Ruptura
      'terminamos', 'ruptura', 'separación', 'ex', 'dejó', 'corazón roto',
      // Económico
      'despido', 'despidieron', 'sin trabajo', 'deudas', 'dinero', 'crisis económica',
      // Bloqueo
      'incapaz', 'no puedo', 'no sirvo', 'incompetente', 'perdido', 'bloqueado',
      // General distress
      'deprimido', 'triste', 'ansiedad', 'estresado', 'agobiado', 'mal',
      'ayuda', 'no sé qué hacer', 'me siento solo'
    ];

    const messageLower = message.toLowerCase();
    return distressKeywords.some(keyword => messageLower.includes(keyword));
  }, []);

  return {
    getRecommendation,
    shouldTriggerRecommendation,
    loading,
    error,
    lastRecommendation
  };
}
