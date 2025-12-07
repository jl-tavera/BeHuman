/**
 * API Route: /api/analyze-transcript
 * 
 * POST: Analyze transcript for emotional distress and trigger appropriate actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscriptDistress } from '@/lib/transcript-analyzer';
import { 
  classifySituation, 
  getRecommendations 
} from '@/Typescript-Integration/recommender';
import { createClient } from '@/utils/supabase/server';
import type { 
  Profile,
  RecommendationResult
} from '@/Typescript-Integration/types';

export interface TranscriptAnalysisRequest {
  transcript: string;
  profile?: Profile;
  anonymousToken?: string;
  sessionId?: string;
}

export interface TranscriptAnalysisResponse {
  success: boolean;
  analysis: {
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    confidence: number;
    needsAttention: boolean;
    recommendedAction: string;
    emotionalProfile: Record<string, number>;
    riskFactors: string[];
  };
  recommendation?: RecommendationResult;
  dashboardAlert?: {
    created: boolean;
    alertId?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  error?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranscriptAnalysisRequest = await request.json();
    
    if (!body.transcript) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: transcript',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Analyze transcript for emotional distress
    const distressAnalysis = analyzeTranscriptDistress(body.transcript);
    
    // Generate anonymous token if not provided
    const anonymousToken = body.anonymousToken || 
      `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    let recommendation: RecommendationResult | undefined;
    let dashboardAlert: any = undefined;
    
    // If moderate or severe distress, generate wellness recommendation
    if (distressAnalysis.severity !== 'mild' && body.profile) {
      const situation = classifySituation(body.transcript);
      
      recommendation = await getRecommendations(
        body.profile,
        situation,
        body.transcript,
        4, // topN
        anonymousToken,
        true // saveToDatabase
      );
    }
    
    // If severe or critical, create dashboard alert
    if (distressAnalysis.severity === 'severe' || distressAnalysis.severity === 'critical') {
      dashboardAlert = await createDashboardAlert({
        transcript: body.transcript,
        analysis: distressAnalysis,
        anonymousToken,
        recommendation,
        sessionId: body.sessionId
      });
    }
    
    const response: TranscriptAnalysisResponse = {
      success: true,
      analysis: {
        severity: distressAnalysis.severity,
        confidence: distressAnalysis.confidence,
        needsAttention: distressAnalysis.needsImmediateAttention,
        recommendedAction: distressAnalysis.recommendedAction,
        emotionalProfile: distressAnalysis.emotionalIndicators,
        riskFactors: distressAnalysis.riskFactors
      },
      recommendation,
      dashboardAlert,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Creates a dashboard alert for severe emotional distress cases
 */
async function createDashboardAlert({
  transcript,
  analysis,
  anonymousToken,
  recommendation,
  sessionId
}: {
  transcript: string;
  analysis: any;
  anonymousToken: string;
  recommendation?: RecommendationResult;
  sessionId?: string;
}) {
  try {
    const supabase = createClient();
    
    // Determine alert priority
    let priority: 'low' | 'medium' | 'high' | 'urgent';
    switch (analysis.severity) {
      case 'critical':
        priority = 'urgent';
        break;
      case 'severe':
        priority = 'high';
        break;
      case 'moderate':
        priority = 'medium';
        break;
      default:
        priority = 'low';
    }
    
    // Create alert record in wellness_requests with special flag
    const alertData = {
      anonymous_token: anonymousToken,
      situation_type: analysis.situationType || 'emotional_distress',
      situation_subtype: 'crisis_alert',
      situation_context: `Emotional distress detected - ${analysis.severity} severity`,
      situation_confidence: analysis.confidence,
      profile_snapshot: { alert_type: 'emotional_crisis', session_id: sessionId },
      transcript_excerpt: transcript.length > 500 ? 
        transcript.substring(0, 500) + '...' : transcript,
      recommended_product_id: recommendation?.product.id || 'CRISIS_SUPPORT',
      recommended_product_name: recommendation?.product.name || 'Crisis Support',
      recommended_product_price: recommendation?.product.price || 0,
      recommended_product_category: 'emotional_support',
      recommended_product_subcategory: 'crisis_intervention',
      product_snapshot: {
        alert_priority: priority,
        risk_factors: analysis.riskFactors,
        emotional_indicators: analysis.emotionalIndicators,
        trigger_keywords: analysis.triggerKeywords,
        needs_immediate_attention: analysis.needsImmediateAttention
      },
      recommendation_score: 100, // High priority for alerts
      recommendation_reasons: [
        {
          factor: 'emotional_crisis_detected',
          score: 100,
          explanation: `${analysis.severity} emotional distress requiring immediate attention`
        }
      ],
      empathic_message: generateCrisisMessage(analysis),
      estimated_productivity_uplift_percent: 0,
      status: analysis.severity === 'critical' ? 'urgent_review' : 'pending'
    };
    
    const { data, error } = await supabase
      .from('wellness_requests')
      .insert(alertData)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating dashboard alert:', error);
      return {
        created: false,
        error: error.message,
        priority
      };
    }
    
    return {
      created: true,
      alertId: data.id,
      priority
    };
    
  } catch (error) {
    console.error('Error in createDashboardAlert:', error);
    return {
      created: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      priority: 'medium' as const
    };
  }
}

/**
 * Generates appropriate crisis message based on severity
 */
function generateCrisisMessage(analysis: any): string {
  const messages = {
    critical: "🚨 ALERT: Critical emotional distress detected. This employee may need immediate professional support. Please prioritize this case and consider escalating to mental health professionals.",
    
    severe: "⚠️ HIGH PRIORITY: Severe emotional distress detected. This employee is experiencing significant psychological difficulty and would benefit from immediate wellness intervention and HR attention.",
    
    moderate: "📋 ATTENTION: Moderate emotional distress detected. This employee is struggling emotionally and could benefit from wellness support to prevent escalation.",
    
    mild: "💡 NOTICE: Mild emotional concerns detected. Monitor this employee's wellbeing and consider proactive wellness offerings."
  };
  
  const baseMessage = messages[analysis.severity as keyof typeof messages] || messages.mild;
  
  if (analysis.riskFactors.length > 0) {
    return `${baseMessage}\n\nRisk factors identified: ${analysis.riskFactors.join(', ')}`;
  }
  
  return baseMessage;
}