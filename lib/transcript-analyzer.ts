/**
 * BeHuman - Transcript Analyzer
 * ==============================
 * Analyzes conversation transcripts for emotional distress severity.
 * Automatically triggers dashboard alerts for severe cases.
 */

import { SITUATION_CONFIG } from '@/Typescript-Integration/recommender';
import type { SituationType } from '@/Typescript-Integration/types';

export interface DistressAnalysis {
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  situationType: SituationType | null;
  triggerKeywords: string[];
  riskFactors: string[];
  needsImmediateAttention: boolean;
  recommendedAction: 'monitor' | 'recommend_wellness' | 'escalate_to_hr' | 'urgent_intervention';
  emotionalIndicators: {
    desperation: number;    // 0-100
    hopelessness: number;   // 0-100
    anxiety: number;        // 0-100
    depression: number;     // 0-100
    anger: number;          // 0-100
  };
}

// Critical keywords that indicate severe distress
const CRITICAL_KEYWORDS = [
  // Suicidal ideation
  'suicidarme', 'matarme', 'acabar con todo', 'no quiero vivir', 'mejor muerto',
  'terminar con mi vida', 'no vale la pena vivir', 'prefiero morir',
  
  // Self-harm indicators
  'cortarme', 'lastimarme', 'hacerme daño', 'autolesiones',
  
  // Extreme desperation
  'no hay salida', 'es el fin', 'todo está perdido', 'no puedo más',
  'me voy a volver loco', 'estoy acabado', 'mi vida no vale nada',
  
  // Substance abuse indicators
  'drogas para olvidar', 'emborracharme hasta morir', 'pastillas para dormir forever',
  'cocaína para sentir', 'marihuana todo el día'
];

// High-risk keywords indicating severe emotional distress
const SEVERE_KEYWORDS = [
  // Extreme emotional states
  'desesperado', 'desesperada', 'sin esperanza', 'perdido totalmente',
  'destruido', 'devastado', 'roto por dentro', 'vacío total',
  
  // Crisis situations
  'crisis total', 'colapso', 'me estoy hundiendo', 'caída libre',
  'tocando fondo', 'no puedo respirar', 'me ahogo',
  
  // Work/life breakdown
  'no rindo nada', 'mi carrera está muerta', 'perdí todo',
  'mi vida es un desastre', 'soy un fracaso total',
  
  // Colombian specific severe expressions
  'estoy jodido', 'la vida me tiene mamado', 'estoy vuelto mierda',
  'me tiene hasta la madre', 'estoy pal' carajo'
];

// Moderate distress keywords
const MODERATE_KEYWORDS = [
  'triste', 'deprimido', 'bajoneado', 'desanimado', 'preocupado',
  'estresado', 'agobiado', 'abrumado', 'confundido', 'perdido',
  'ansioso', 'nervioso', 'angustiado', 'frustrado', 'desalentado',
  'mamado', 'cansado de todo', 'harto', 'aburrido de la vida'
];

// Mild distress keywords
const MILD_KEYWORDS = [
  'un poco mal', 'medio bajoneado', 'no muy bien', 'algo preocupado',
  'un toque estresado', 'regular nomás', 'así así', 'no tan bien'
];

/**
 * Analyzes a transcript for emotional distress severity
 */
export function analyzeTranscriptDistress(transcript: string): DistressAnalysis {
  const lowerTranscript = transcript.toLowerCase();
  const words = lowerTranscript.split(/\s+/);
  
  // Check for critical keywords (immediate intervention needed)
  const criticalMatches = CRITICAL_KEYWORDS.filter(keyword => 
    lowerTranscript.includes(keyword)
  );
  
  if (criticalMatches.length > 0) {
    return {
      severity: 'critical',
      confidence: 0.95,
      situationType: detectSituationType(transcript),
      triggerKeywords: criticalMatches,
      riskFactors: ['suicidal_ideation', 'self_harm_risk', 'crisis_state'],
      needsImmediateAttention: true,
      recommendedAction: 'urgent_intervention',
      emotionalIndicators: calculateEmotionalIndicators(transcript, 'critical')
    };
  }
  
  // Check for severe distress
  const severeMatches = SEVERE_KEYWORDS.filter(keyword => 
    lowerTranscript.includes(keyword)
  );
  
  if (severeMatches.length >= 2 || 
      (severeMatches.length >= 1 && transcript.length > 200)) {
    return {
      severity: 'severe',
      confidence: 0.85,
      situationType: detectSituationType(transcript),
      triggerKeywords: severeMatches,
      riskFactors: analyzeRiskFactors(transcript),
      needsImmediateAttention: true,
      recommendedAction: 'escalate_to_hr',
      emotionalIndicators: calculateEmotionalIndicators(transcript, 'severe')
    };
  }
  
  // Check for moderate distress
  const moderateMatches = MODERATE_KEYWORDS.filter(keyword => 
    lowerTranscript.includes(keyword)
  );
  
  if (moderateMatches.length >= 2) {
    return {
      severity: 'moderate',
      confidence: 0.75,
      situationType: detectSituationType(transcript),
      triggerKeywords: moderateMatches,
      riskFactors: analyzeRiskFactors(transcript),
      needsImmediateAttention: false,
      recommendedAction: 'recommend_wellness',
      emotionalIndicators: calculateEmotionalIndicators(transcript, 'moderate')
    };
  }
  
  // Check for mild distress
  const mildMatches = MILD_KEYWORDS.filter(keyword => 
    lowerTranscript.includes(keyword)
  );
  
  if (mildMatches.length >= 1) {
    return {
      severity: 'mild',
      confidence: 0.65,
      situationType: detectSituationType(transcript),
      triggerKeywords: mildMatches,
      riskFactors: [],
      needsImmediateAttention: false,
      recommendedAction: 'monitor',
      emotionalIndicators: calculateEmotionalIndicators(transcript, 'mild')
    };
  }
  
  // No significant distress detected
  return {
    severity: 'mild',
    confidence: 0.3,
    situationType: null,
    triggerKeywords: [],
    riskFactors: [],
    needsImmediateAttention: false,
    recommendedAction: 'monitor',
    emotionalIndicators: {
      desperation: 10,
      hopelessness: 10,
      anxiety: 15,
      depression: 10,
      anger: 10
    }
  };
}

/**
 * Detects the primary situation type from transcript
 */
function detectSituationType(transcript: string): SituationType | null {
  const lowerTranscript = transcript.toLowerCase();
  
  for (const [situationType, config] of Object.entries(SITUATION_CONFIG)) {
    const matchedKeywords = config.keywords.filter(keyword => 
      lowerTranscript.includes(keyword)
    );
    
    if (matchedKeywords.length >= 2) {
      return situationType as SituationType;
    }
  }
  
  return null;
}

/**
 * Analyzes risk factors present in the transcript
 */
function analyzeRiskFactors(transcript: string): string[] {
  const lowerTranscript = transcript.toLowerCase();
  const riskFactors: string[] = [];
  
  // Social isolation
  if (lowerTranscript.includes('solo') || lowerTranscript.includes('nadie') || 
      lowerTranscript.includes('aislado')) {
    riskFactors.push('social_isolation');
  }
  
  // Financial stress
  if (lowerTranscript.includes('dinero') || lowerTranscript.includes('deudas') || 
      lowerTranscript.includes('trabajo')) {
    riskFactors.push('financial_stress');
  }
  
  // Relationship problems
  if (lowerTranscript.includes('ruptura') || lowerTranscript.includes('pareja') || 
      lowerTranscript.includes('familia')) {
    riskFactors.push('relationship_issues');
  }
  
  // Health concerns
  if (lowerTranscript.includes('enfermo') || lowerTranscript.includes('salud') || 
      lowerTranscript.includes('dolor')) {
    riskFactors.push('health_concerns');
  }
  
  // Work stress
  if (lowerTranscript.includes('jefe') || lowerTranscript.includes('oficina') || 
      lowerTranscript.includes('trabajo')) {
    riskFactors.push('work_stress');
  }
  
  return riskFactors;
}

/**
 * Calculates emotional indicator scores based on transcript content
 */
function calculateEmotionalIndicators(transcript: string, severity: string) {
  const lowerTranscript = transcript.toLowerCase();
  
  const baseScores = {
    critical: { desperation: 85, hopelessness: 90, anxiety: 80, depression: 85, anger: 70 },
    severe: { desperation: 70, hopelessness: 75, anxiety: 70, depression: 70, anger: 60 },
    moderate: { desperation: 45, hopelessness: 50, anxiety: 55, depression: 50, anger: 40 },
    mild: { desperation: 25, hopelessness: 20, anxiety: 30, depression: 25, anger: 20 }
  };
  
  const base = baseScores[severity as keyof typeof baseScores] || baseScores.mild;
  
  // Adjust based on specific keywords
  const adjustments = { ...base };
  
  // Desperation indicators
  if (lowerTranscript.includes('desesperado') || lowerTranscript.includes('no puedo más')) {
    adjustments.desperation = Math.min(100, adjustments.desperation + 15);
  }
  
  // Hopelessness indicators
  if (lowerTranscript.includes('sin esperanza') || lowerTranscript.includes('no hay salida')) {
    adjustments.hopelessness = Math.min(100, adjustments.hopelessness + 20);
  }
  
  // Anxiety indicators
  if (lowerTranscript.includes('ansioso') || lowerTranscript.includes('nervioso')) {
    adjustments.anxiety = Math.min(100, adjustments.anxiety + 15);
  }
  
  // Depression indicators
  if (lowerTranscript.includes('deprimido') || lowerTranscript.includes('triste')) {
    adjustments.depression = Math.min(100, adjustments.depression + 15);
  }
  
  // Anger indicators
  if (lowerTranscript.includes('enojado') || lowerTranscript.includes('furioso')) {
    adjustments.anger = Math.min(100, adjustments.anger + 20);
  }
  
  return adjustments;
}