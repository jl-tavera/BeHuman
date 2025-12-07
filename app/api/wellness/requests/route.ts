/**
 * API Route: /api/wellness/requests
 * 
 * GET: Get all wellness requests (optionally filtered by status)
 * POST: Create a new wellness request (from chat system)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllWellnessRequests, 
  createWellnessRequest 
} from '@/Typescript-Integration/supabaseClient';
import type { 
  CreateWellnessRequestInput, 
  ApiResponse, 
  WellnessRequest 
} from '@/Typescript-Integration/types';

/**
 * GET /api/wellness/requests
 * Get all wellness requests (for admin dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    
    const requests = await getAllWellnessRequests(status || undefined);
    
    const response: ApiResponse<WellnessRequest[]> = {
      success: true,
      data: requests,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wellness requests:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/wellness/requests
 * Create a new wellness request
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateWellnessRequestInput = await request.json();
    
    // Validate required fields
    if (!body.anonymousToken || !body.situation || !body.profile || !body.topRecommendation) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields',
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    const wellnessRequest = await createWellnessRequest(body);
    
    const response: ApiResponse<WellnessRequest> = {
      success: true,
      data: wellnessRequest,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating wellness request:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
