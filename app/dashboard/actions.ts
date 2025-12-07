"use server";

import { getSupabaseServerClient } from "@/utils/supabase/server";

export interface AreaData {
  name: string;
  data: {
    stress: number;
    emotion: number;
    anxiety: number;
  };
}

export interface TrendDataPoint {
  month: string;
  value: number;
}

export interface TrendData {
  general: TrendDataPoint[];
  [area: string]: TrendDataPoint[];
}

export interface DashboardMetrics {
  generalStress: number;
  anxietyInterventions: number;
  criticalAlerts: number;
}

export interface ScoreDistribution {
  score: number;
  count: number;
}

export interface DistributionData {
  general: ScoreDistribution[];
  [area: string]: ScoreDistribution[];
}

/**
 * Fetch aggregated company mood data from the database view
 */
export async function getCompanyMoodAggregates() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_mood_aggregates")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching company mood aggregates:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch area-based psychometric data by joining answers with onboarding profiles
 */
export async function getAreaBasedMetrics(): Promise<AreaData[]> {
  const supabase = await getSupabaseServerClient();

  // Get all psychometric answers with user profiles
  const { data: answers, error: answersError } = await supabase
    .from("psychometric_answers")
    .select(`
      answer,
      question_id,
      psychometric_questions!inner(block_category),
      user_id
    `);

  if (answersError) {
    console.error("Error fetching answers:", answersError);
    return [];
  }

  // Get user profiles with company areas
  const { data: profiles, error: profilesError } = await supabase
    .from("onboarding_profiles")
    .select("user_id, company_area");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return [];
  }

  // Create a map of user_id to company_area
  const userAreaMap = new Map(
    profiles?.map((p) => [p.user_id, p.company_area]) || []
  );

  // Group answers by area and category
  const areaMetrics: Record<string, { stress: number[]; emotion: number[]; anxiety: number[] }> = {};

  answers?.forEach((answer: any) => {
    const area = userAreaMap.get(answer.user_id);
    if (!area) return;

    if (!areaMetrics[area]) {
      areaMetrics[area] = { stress: [], emotion: [], anxiety: [] };
    }

    const category = answer.psychometric_questions.block_category;
    const value = answer.answer;

    if (category === "ESTRES") {
      areaMetrics[area].stress.push(value);
    } else if (category === "BIENESTAR") {
      // Map BIENESTAR to emotion (higher is better)
      areaMetrics[area].emotion.push(value);
    } else if (category === "ANSIEDAD") {
      areaMetrics[area].anxiety.push(value);
    }
  });

  // Calculate averages and normalize to 0-100 scale
  return Object.entries(areaMetrics).map(([name, metrics]) => ({
    name,
    data: {
      stress: normalizeScore(average(metrics.stress)),
      emotion: normalizeScore(average(metrics.emotion)),
      anxiety: normalizeScore(average(metrics.anxiety)),
    },
  }));
}

/**
 * Fetch trend data for stress, emotion, and anxiety over time
 */
export async function getTrendData(): Promise<{
  stress: TrendData;
  emotion: TrendData;
  anxiety: TrendData;
}> {
  const supabase = await getSupabaseServerClient();

  // Get aggregated data from the view
  const { data: aggregates, error } = await supabase
    .from("company_mood_aggregates")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching trend data:", error);
    return {
      stress: { general: [] },
      emotion: { general: [] },
      anxiety: { general: [] },
    };
  }

  // Get answers with user areas for area-specific trends
  const { data: answers, error: answersError } = await supabase
    .from("psychometric_answers")
    .select(`
      answer,
      created_at,
      question_id,
      psychometric_questions!inner(block_category),
      user_id
    `)
    .order("created_at", { ascending: true });

  if (answersError) {
    console.error("Error fetching answers for trends:", answersError);
  }

  // Get user profiles
  const { data: profiles } = await supabase
    .from("onboarding_profiles")
    .select("user_id, company_area");

  const userAreaMap = new Map(
    profiles?.map((p) => [p.user_id, p.company_area]) || []
  );

  // Process general trends from aggregates
  const stressTrend = processGeneralTrend(aggregates || [], "ESTRES");
  const emotionTrend = processGeneralTrend(aggregates || [], "BIENESTAR");
  const anxietyTrend = processGeneralTrend(aggregates || [], "ANSIEDAD");

  // Process area-specific trends
  const areaStressTrends = processAreaTrends(answers || [], userAreaMap, "ESTRES");
  const areaEmotionTrends = processAreaTrends(answers || [], userAreaMap, "BIENESTAR");
  const areaAnxietyTrends = processAreaTrends(answers || [], userAreaMap, "ANSIEDAD");

  return {
    stress: { general: stressTrend, ...areaStressTrends },
    emotion: { general: emotionTrend, ...areaEmotionTrends },
    anxiety: { general: anxietyTrend, ...areaAnxietyTrends },
  };
}

/**
 * Fetch score distribution data for stress, emotion, and anxiety
 */
export async function getScoreDistribution(): Promise<{
  stress: DistributionData;
  emotion: DistributionData;
  anxiety: DistributionData;
}> {
  const supabase = await getSupabaseServerClient();

  // Get all psychometric answers with user profiles
  const { data: answers, error: answersError } = await supabase
    .from("psychometric_answers")
    .select(`
      answer,
      question_id,
      psychometric_questions!inner(block_category),
      user_id
    `);

  if (answersError) {
    console.error("Error fetching answers for distribution:", answersError);
    return {
      stress: { general: [] },
      emotion: { general: [] },
      anxiety: { general: [] },
    };
  }

  // Get user profiles with company areas
  const { data: profiles } = await supabase
    .from("onboarding_profiles")
    .select("user_id, company_area");

  const userAreaMap = new Map(
    profiles?.map((p) => [p.user_id, p.company_area]) || []
  );

  // Process distributions
  const stressDistribution = processDistribution(answers || [], userAreaMap, "ESTRES");
  const emotionDistribution = processDistribution(answers || [], userAreaMap, "BIENESTAR");
  const anxietyDistribution = processDistribution(answers || [], userAreaMap, "ANSIEDAD");

  return {
    stress: stressDistribution,
    emotion: emotionDistribution,
    anxiety: anxietyDistribution,
  };
}

/**
 * Fetch general dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await getSupabaseServerClient();

  // Get recent stress data
  const { data: stressData } = await supabase
    .from("company_mood_aggregates")
    .select("avg_score")
    .eq("block_category", "ESTRES")
    .order("date", { ascending: false })
    .limit(1);

  // Get anxiety intervention count (answers with high anxiety scores)
  const { data: anxietyInterventions } = await supabase
    .from("psychometric_answers")
    .select("id", { count: "exact" })
    .gte("answer", 4) // High anxiety threshold
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  // Get critical alerts (very high stress or anxiety)
  const { data: criticalAlerts } = await supabase
    .from("psychometric_answers")
    .select(`
      id,
      answer,
      psychometric_questions!inner(block_category)
    `, { count: "exact" })
    .or('psychometric_questions.block_category.eq.ESTRES,psychometric_questions.block_category.eq.ANSIEDAD')
    .gte("answer", 4)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

  return {
    generalStress: stressData?.[0]?.avg_score || 0,
    anxietyInterventions: anxietyInterventions?.length || 0,
    criticalAlerts: criticalAlerts?.length || 0,
  };
}

// Helper functions

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function normalizeScore(score: number, max = 5): number {
  // Convert from 0-5 scale to 0-100 scale
  return Math.round((score / max) * 100);
}

function processGeneralTrend(aggregates: any[], category: string): TrendDataPoint[] {
  const categoryData = aggregates.filter((a) => a.block_category === category);

  // Group by quarter
  const quarters = new Map<string, number[]>();

  categoryData.forEach((item) => {
    const date = new Date(item.date);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;

    if (!quarters.has(quarter)) {
      quarters.set(quarter, []);
    }
    quarters.get(quarter)?.push(parseFloat(item.avg_score));
  });

  // Convert to trend data points
  return Array.from(quarters.entries()).map(([quarter, scores]) => ({
    month: quarter,
    value: Math.round(average(scores)),
  }));
}

function processAreaTrends(
  answers: any[],
  userAreaMap: Map<string, string>,
  category: string
): Record<string, TrendDataPoint[]> {
  const areaTrends: Record<string, Map<string, number[]>> = {};

  answers.forEach((answer: any) => {
    if (answer.psychometric_questions?.block_category !== category) return;

    const area = userAreaMap.get(answer.user_id);
    if (!area) return;

    if (!areaTrends[area]) {
      areaTrends[area] = new Map();
    }

    const date = new Date(answer.created_at);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;

    if (!areaTrends[area].has(quarter)) {
      areaTrends[area].set(quarter, []);
    }

    areaTrends[area].get(quarter)?.push(answer.answer);
  });

  // Convert to trend data
  const result: Record<string, TrendDataPoint[]> = {};

  Object.entries(areaTrends).forEach(([area, quarters]) => {
    result[area] = Array.from(quarters.entries()).map(([quarter, scores]) => ({
      month: quarter,
      value: normalizeScore(average(scores)),
    }));
  });

  return result;
}

function processDistribution(
  answers: any[],
  userAreaMap: Map<string, string>,
  category: string
): DistributionData {
  // Initialize score buckets (1-5)
  const initScoreBuckets = (): Map<number, number> => {
    const buckets = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      buckets.set(i, 0);
    }
    return buckets;
  };

  // General distribution
  const generalScores = initScoreBuckets();

  // Area-specific distributions
  const areaScores: Record<string, Map<number, number>> = {};

  answers.forEach((answer: any) => {
    if (answer.psychometric_questions?.block_category !== category) return;

    const score = Math.round(answer.answer); // Round to nearest integer (1-5)

    // Update general distribution
    generalScores.set(score, (generalScores.get(score) || 0) + 1);

    // Update area-specific distribution
    const area = userAreaMap.get(answer.user_id);
    if (area) {
      if (!areaScores[area]) {
        areaScores[area] = initScoreBuckets();
      }
      areaScores[area].set(score, (areaScores[area].get(score) || 0) + 1);
    }
  });

  // Convert to distribution data format
  const result: DistributionData = {
    general: Array.from(generalScores.entries()).map(([score, count]) => ({
      score,
      count,
    })),
  };

  // Add area-specific distributions
  Object.entries(areaScores).forEach(([area, scores]) => {
    result[area] = Array.from(scores.entries()).map(([score, count]) => ({
      score,
      count,
    }));
  });

  return result;
}

// ============================================================================
// WELLNESS RECOMMENDATION INTEGRATION
// ============================================================================

export interface WellnessRecommendation {
  id: string;
  anonymous_token: string;
  situation_type: string;
  situation_subtype?: string;
  situation_context?: string;
  situation_confidence: number;
  profile_snapshot: any;
  transcript_excerpt?: string;
  recommended_product_id: string;
  recommended_product_name: string;
  recommended_product_price: number;
  recommended_product_category?: string;
  recommended_product_subcategory?: string;
  product_snapshot: any;
  recommendation_score: number;
  recommendation_reasons: string[];
  empathic_message?: string;
  estimated_productivity_uplift_percent: number;
  status: string;
  created_at: string;
}

/**
 * Fetch pending wellness recommendations from the database
 */
export async function getWellnessRecommendations(): Promise<WellnessRecommendation[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("wellness_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wellness recommendations:", error);
    return [];
  }

  return data || [];
}

/**
 * Approve a wellness recommendation
 */
export async function approveWellnessRecommendation(requestId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("wellness_requests")
    .update({ 
      status: "approved",
      reviewed_at: new Date().toISOString()
    })
    .eq("id", requestId);

  if (error) {
    console.error("Error approving wellness recommendation:", error);
    return false;
  }

  return true;
}

/**
 * Reject a wellness recommendation
 */
export async function rejectWellnessRecommendation(requestId: string, reason?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("wellness_requests")
    .update({ 
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq("id", requestId);

  if (error) {
    console.error("Error rejecting wellness recommendation:", error);
    return false;
  }

  return true;
}
