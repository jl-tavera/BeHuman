/**
 * API Route: /api/wellness/budget
 * 
 * GET: Get current budget status
 * POST: Create/update budget
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBudgetStatus, upsertAdminBudget } from '@/Typescript-Integration/supabaseClient';
import type { ApiResponse, AdminBudget, UpdateBudgetRequest } from '@/Typescript-Integration/types';

/**
 * GET /api/wellness/budget
 * Get current budget status
 */
export async function GET() {
  try {
    const budget = await getCurrentBudgetStatus();
    
    const response: ApiResponse<AdminBudget | null> = {
      success: true,
      data: budget,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching budget:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/wellness/budget
 * Create or update budget
 */
export async function POST(request: NextRequest) {
  try {
    const body: UpdateBudgetRequest = await request.json();
    
    // Validate required fields
    if (!body.periodStart || !body.periodEnd || body.totalBudget === undefined) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: periodStart, periodEnd, totalBudget',
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    const budget = await upsertAdminBudget({
      period_start: body.periodStart,
      period_end: body.periodEnd,
      total_budget: body.totalBudget
    });
    
    const response: ApiResponse<AdminBudget> = {
      success: true,
      data: budget,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating budget:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
