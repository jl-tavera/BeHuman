'use client';

import { useState, useCallback } from 'react';
import type { Profile, RecommendationResult } from '@/Typescript-Integration/types';

interface TranscriptAnalysis {
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  needsAttention: boolean;
  recommendedAction: string;
  emotionalProfile: Record<string, number>;
  riskFactors: string[];
}

interface UseTranscriptAnalysisOptions {
  profile?: Profile;
  onAnalysisComplete?: (analysis: TranscriptAnalysis, recommendation?: RecommendationResult) => void;
  onCrisisDetected?: (analysis: TranscriptAnalysis) => void;
}

export function useTranscriptAnalysis({
  profile,
  onAnalysisComplete,
  onCrisisDetected
}: UseTranscriptAnalysisOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<RecommendationResult | null>(null);

  /**
   * Analyzes transcript for emotional distress and triggers appropriate actions
   */
  const analyzeTranscript = useCallback(async (
    transcript: string,
    sessionId?: string,
    anonymousToken?: string
  ) => {
    if (!transcript.trim()) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          profile,
          anonymousToken,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      const analysis = data.analysis;
      const recommendation = data.recommendation;

      setLastAnalysis(analysis);
      setLastRecommendation(recommendation);

      // Trigger callbacks
      onAnalysisComplete?.(analysis, recommendation);

      // If severe or critical, trigger crisis callback
      if (analysis.severity === 'severe' || analysis.severity === 'critical') {
        onCrisisDetected?.(analysis);
      }

      return {
        analysis,
        recommendation,
        dashboardAlert: data.dashboardAlert
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Transcript analysis error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile, onAnalysisComplete, onCrisisDetected]);

  /**
   * Determines if transcript should trigger analysis based on emotional keywords
   */
  const shouldTriggerAnalysis = useCallback((transcript: string): boolean => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Emotional distress keywords
    const triggerKeywords = [
      // Spanish emotional indicators
      'triste', 'deprimido', 'mal', 'horrible', 'terrible', 'desesperado',
      'perdido', 'confundido', 'solo', 'vacío', 'sin esperanza', 'acabado',
      'no puedo', 'no sirvo', 'incapaz', 'inútil', 'fracaso', 'roto',
      'destruido', 'devastado', 'hundido', 'tocando fondo',
      
      // Situation-specific
      'murió', 'falleció', 'muerte', 'duelo', 'funeral',
      'ruptura', 'terminamos', 'dejó', 'corazón roto', 'tusa',
      'dinero', 'deudas', 'despido', 'trabajo', 'económico',
      'bloqueado', 'estancado', 'no entiendo', 'perdido',
      
      // Colombian expressions
      'mamado', 'jodido', 'vuelto mierda', 'pal carajo', 'hasta la madre'
    ];

    return triggerKeywords.some(keyword => lowerTranscript.includes(keyword));
  }, []);

  /**
   * Get severity level for UI display
   */
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'severe':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'mild':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  /**
   * Get severity emoji for UI
   */
  const getSeverityEmoji = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'severe':
        return '⚠️';
      case 'moderate':
        return '📋';
      case 'mild':
        return '💡';
      default:
        return '📝';
    }
  }, []);

  return {
    loading,
    error,
    lastAnalysis,
    lastRecommendation,
    analyzeTranscript,
    shouldTriggerAnalysis,
    getSeverityColor,
    getSeverityEmoji
  };
}