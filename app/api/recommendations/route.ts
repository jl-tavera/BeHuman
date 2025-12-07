/**
 * API Route: /api/recommendations
 * 
 * POST: Get recommendations for a user based on their situation
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  classifySituation, 
  getRecommendations 
} from '@/Typescript-Integration/recommender';
import type { 
  RecommendationRequest, 
  ApiResponse, 
  RecommendationResult,
  Profile
} from '@/Typescript-Integration/types';

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    
    // Validate required fields
    if (!body.transcript || !body.profile) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: transcript and profile',
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    // Classify the situation from transcript
    const situation = classifySituation(body.transcript);
    
    // Generate anonymous token if not provided
    const anonymousToken = body.anonymousToken || 
      `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Get recommendations (and save to database)
    const result = await getRecommendations(
      body.profile,
      situation,
      body.transcript,
      4, // topN
      anonymousToken,
      true // saveToDatabase
    );
    
    const response: ApiResponse<RecommendationResult> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
