/**
 * BeHuman - Cliente Supabase
 * ==========================
 * Helper para conectar con Supabase y consultar productos.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product } from './types';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Obtiene o crea la instancia de Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase URL and Key must be configured in environment variables');
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseInstance;
.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcXZodGFsd2RveHBpcWNodXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjMwMDMsImV4cCI6MjA4MDYzOTAwM30.X2IcMxWbF54fALebzFAlck-dynw_2rdJCRaBFXRzX7g}

// ============================================================================
// CONSULTAS DE PRODUCTOS
// ============================================================================

const TABLE_NAME = 'Compensar-Database';

/**
 * Obtiene todos los productos de la base de datos
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('nombre');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Busca productos por tags de situación
 */
export async function getProductsBySituationTags(tags: string[]): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  // Supabase: buscar productos que contengan al menos uno de los tags
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .overlaps('situation_tags', tags);
  
  if (error) {
    console.error('Error fetching products by situation:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Busca productos por categoría
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('categoria_principal', category);
  
  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Busca productos por subcategoría
 */
export async function getProductsBySubcategory(subcategory: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .ilike('subcategoria', `%${subcategory}%`);
  
  if (error) {
    console.error('Error fetching products by subcategory:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Busca productos por texto (nombre o descripción)
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);
  
  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }
  
  return data || [];
}

// ============================================================================
// INTERVENCIONES (para guardar cuando HR aprueba)
// ============================================================================

export interface Intervention {
  id?: number;
  anonymous_employee_token: string;
  product_id: number;
  product_snapshot: object;
  estimated_uplift: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

/**
 * Guarda una intervención aprobada por HR
 */
export async function saveIntervention(intervention: Omit<Intervention, 'id' | 'created_at'>): Promise<Intervention> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('interventions')
    .insert([{
      ...intervention,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error saving intervention:', error);
    throw error;
  }
  
  return data;
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export interface Notification {
  id?: number;
  anonymous_employee_token: string;
  title: string;
  body: string;
  metadata?: object;
  delivered: boolean;
  created_at?: string;
}

/**
 * Crea una notificación para el empleado
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      ...notification,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
  
  return data;
}

// ============================================================================
// WELLNESS REQUEST SYSTEM
// ============================================================================

import type { 
  WellnessRequest, 
  CreateWellnessRequestInput, 
  AdminBudget, 
  EmployeeNotification as WellnessNotification,
  Situation,
  Profile,
  ScoredProduct
} from './types';

/**
 * Creates a wellness request in the database
 */
export async function createWellnessRequest(
  input: CreateWellnessRequestInput
): Promise<WellnessRequest> {
  const supabase = getSupabaseClient();
  
  const requestData = {
    anonymous_token: input.anonymousToken,
    situation_type: input.situation.type,
    situation_subtype: input.situation.subtype,
    situation_context: input.situation.context,
    situation_confidence: input.situation.confidence,
    profile_snapshot: input.profile,
    transcript_excerpt: input.transcriptExcerpt,
    recommended_product_id: input.topRecommendation.product.id,
    recommended_product_name: input.topRecommendation.product.nombre,
    recommended_product_price: input.topRecommendation.product.precio_desde,
    recommended_product_category: input.topRecommendation.product.categoria_principal,
    recommended_product_subcategory: input.topRecommendation.product.subcategoria,
    product_snapshot: input.topRecommendation.product,
    recommendation_score: input.topRecommendation.score,
    recommendation_reasons: input.topRecommendation.reasons,
    empathic_message: input.empathicMessage,
    estimated_productivity_uplift_percent: 15,
    status: 'pending'
  };
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .insert([requestData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating wellness request:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets all pending wellness requests for admin dashboard
 */
export async function getPendingWellnessRequests(): Promise<WellnessRequest[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending wellness requests:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Gets all wellness requests (for admin dashboard with filters)
 */
export async function getAllWellnessRequests(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<WellnessRequest[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('wellness_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching wellness requests:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Approves a wellness request
 */
export async function approveWellnessRequest(
  requestId: string,
  adminUserId: string
): Promise<WellnessRequest> {
  const supabase = getSupabaseClient();
  
  // Update the request status
  const { data, error } = await supabase
    .from('wellness_requests')
    .update({
      status: 'approved',
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) {
    console.error('Error approving wellness request:', error);
    throw error;
  }
  
  // Create notification for employee
  if (data) {
    await createWellnessNotification({
      wellness_request_id: data.id,
      anonymous_token: data.anonymous_token,
      title: '¡Buenas noticias! 🎉',
      message: `Tu empresa ha aprobado tu solicitud de bienestar: ${data.recommended_product_name}. ${data.empathic_message || ''}`,
      intervention_details: data.product_snapshot,
      delivered: false,
      read: false
    });
  }
  
  return data;
}

/**
 * Rejects a wellness request
 */
export async function rejectWellnessRequest(
  requestId: string,
  adminUserId: string,
  reason?: string
): Promise<WellnessRequest> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .update({
      status: 'rejected',
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) {
    console.error('Error rejecting wellness request:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets current budget status
 */
export async function getCurrentBudgetStatus(): Promise<AdminBudget | null> {
  const supabase = getSupabaseClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('admin_budget')
    .select('*')
    .lte('period_start', today)
    .gte('period_end', today)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching budget status:', error);
    throw error;
  }
  
  return data;
}

/**
 * Creates or updates admin budget
 */
export async function upsertAdminBudget(budget: {
  period_start: string;
  period_end: string;
  total_budget: number;
}): Promise<AdminBudget> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('admin_budget')
    .upsert([{
      ...budget,
      allocated_budget: 0,
      spent_budget: 0
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting admin budget:', error);
    throw error;
  }
  
  return data;
}

/**
 * Creates a wellness notification for an employee
 */
async function createWellnessNotification(
  notification: Omit<WellnessNotification, 'id' | 'created_at' | 'updated_at'>
): Promise<WellnessNotification> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('employee_notifications')
    .insert([notification])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating wellness notification:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets notifications for an anonymous employee
 */
export async function getEmployeeNotifications(
  anonymousToken: string
): Promise<WellnessNotification[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('employee_notifications')
    .select('*')
    .eq('anonymous_token', anonymousToken)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching employee notifications:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('employee_notifications')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}
