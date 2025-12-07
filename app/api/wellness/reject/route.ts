/**
 * API Route: /api/wellness/reject
 * 
 * POST: Reject a wellness request
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectWellnessRequest } from '@/Typescript-Integration/supabaseClient';
import type { ApiResponse, WellnessRequest, HRDecisionRequest } from '@/Typescript-Integration/types';

export async function POST(request: NextRequest) {
  try {
    const body: HRDecisionRequest = await request.json();
    
    // Validate required fields
    if (!body.requestId || !body.adminUserId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: requestId and adminUserId',
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    const rejectedRequest = await rejectWellnessRequest(
      body.requestId, 
      body.adminUserId, 
      body.reason
    );
    
    const response: ApiResponse<WellnessRequest> = {
      success: true,
      data: rejectedRequest,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error rejecting wellness request:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
