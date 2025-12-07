/**
 * BeHuman - Tipos e Interfaces
 * ============================
 * Definiciones de tipos para el sistema de recomendación empático.
 * 
 * Flujo:
 * 1. Voice Agent → Transcript
 * 2. Transcript → Situation Classification
 * 3. Situation + Profile → Product Recommendations
 * 4. Recommendations → HR Cards
 * 5. HR Approval → Employee Notification
 * 
 * Profile Tags (basados en características del perfil):
 * - Edad: joven (18-30), adulto (30-50), mayor (50+)
 * - Hobbies: tech, musica, deportes, arte, lectura, cocina, viajes, naturaleza
 * - Metas: familia, amigos, bienes, carrera, salud, crecimiento_personal
 * 
 * Situation Tags (4 categorías principales):
 * - muerte_familiar: Pérdida de un ser querido
 * - causa_economica: Problemas financieros/laborales
 * - bloqueo_incapacidad: Sentirse incapaz/incompetente
 * - rompimiento_pareja: Ruptura amorosa
 */

// ============================================================================
// PROFILE TAGS - Características del usuario
// ============================================================================

/**
 * Categorías de edad para profile tags
 */
export type AgeCategory = 'joven' | 'adulto' | 'mayor';

/**
 * Hobbies reconocidos por el sistema
 */
export type HobbyTag = 
  | 'tech' 
  | 'musica' 
  | 'deportes' 
  | 'arte' 
  | 'lectura' 
  | 'cocina' 
  | 'viajes' 
  | 'naturaleza'
  | 'manualidades'
  | 'social';

/**
 * Metas/objetivos del usuario
 */
export type GoalTag = 
  | 'familia' 
  | 'amigos' 
  | 'bienes' 
  | 'carrera' 
  | 'salud' 
  | 'crecimiento_personal'
  | 'estabilidad';

/**
 * Todos los profile tags posibles
 */
export type ProfileTag = AgeCategory | HobbyTag | GoalTag;

// ============================================================================
// SITUATION TAGS - 4 categorías principales
// ============================================================================

/**
 * Las 4 categorías principales de situaciones psicológicas
 */
export type SituationTag = 
  | 'muerte_familiar'      // Pérdida de un ser querido, duelo
  | 'causa_economica'      // Problemas financieros, laborales, despido
  | 'bloqueo_incapacidad'  // Sentirse incapaz, incompetente, caso perdido
  | 'rompimiento_pareja';  // Ruptura amorosa, divorcio, separación

/**
 * Descripciones de cada situación
 */
export const SITUATION_DESCRIPTIONS: Record<SituationTag, string> = {
  muerte_familiar: 'Pérdida de un ser querido, duelo, fallecimiento',
  causa_economica: 'Problemas financieros, laborales, despido, deudas',
  bloqueo_incapacidad: 'Sentirse incapaz, incompetente, sin valor, caso perdido',
  rompimiento_pareja: 'Ruptura amorosa, divorcio, separación',
};

// ============================================================================
// PERFIL DE USUARIO
// ============================================================================

/**
 * Profile represents an anonymous user profile
 * Used for personalized recommendations without revealing identity
 */
export interface Profile {
  userId: string;
  name: string;
  age?: number;
  ageCategory?: AgeCategory;  // joven (18-30), adulto (30-50), mayor (50+)
  gender?: 'masculino' | 'femenino' | 'no-binario' | string;
  hobbies: string[];  // HobbyTag[]
  goals: string[];    // GoalTag[]
  location?: string;  // Opcional: ubicación
  economicSituation?: string;  // Opcional: situación económica
}

// Alias for backwards compatibility
export type UserProfile = Profile;

// ============================================================================
// SITUACIÓN / CONFLICTO
// ============================================================================

/**
 * Supported situation types that the system can classify
 * Ahora basado en las 4 categorías principales
 */
export type SituationType = SituationTag;

/**
 * Represents a detected psychological/emotional situation
 * Classified from voice transcript analysis
 */
export interface Situation {
  type: SituationType | string;
  subtype?: string;
  context: string;
  confidence?: number;
}

// ============================================================================
// PRODUCTO DE COMPENSAR
// ============================================================================

/**
 * Product from Compensar Tienda catalog
 * Stored in Supabase `Compensar-Database` table
 */
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio_desde: number;
  subcategoria: string;
  categoria_principal: string;
  url: string;
  profile_tags: ProfileTag[] | string[];  // Edad + Hobbies + Metas
  situation_tags: SituationTag[] | string[];  // Las 4 categorías
  created_at?: string;
}

// ============================================================================
// PRODUCTO PUNTUADO
// ============================================================================

/**
 * A product with its recommendation score and reasons
 */
export interface ScoredProduct {
  product: Product;
  score: number;
  reasons: string[];
}

// Alias for backwards compatibility
export type Recommendation = ScoredProduct;

// ============================================================================
// TARJETA PARA HR
// ============================================================================

/**
 * HR Card - Presented to HR for approval
 * Contains product info, explanation, and estimated productivity impact
 */
export interface HRCard {
  id: string;
  product: Product;
  title: string;
  subtitle: string;
  explanation: string;
  estimatedProductivityUpliftPercent: number;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// NOTIFICACIÓN AL EMPLEADO
// ============================================================================

/**
 * Intervention details included in employee notification
 */
export interface Intervention {
  title: string;
  description: string;
  url: string;
  category: string;
  subcategory: string;
  price: number;
  estimatedProductivityUpliftPercent: number;
}

/**
 * Anonymous notification sent to the employee after HR approval
 */
export interface EmployeeNotification {
  id: string;
  anonymous: true;
  message: string;
  intervention: Intervention;
  createdAt: string;
  acceptedCardId: string;
}

// ============================================================================
// RESULTADO DEL SISTEMA
// ============================================================================

/**
 * Complete result from the recommendation system
 */
export interface RecommendationResult {
  situation: Situation;
  recommendations: ScoredProduct[];
  hrCards?: HRCard[];
  empathicMessage: string;
  messageLength: number;
  profile: Profile;
  timestamp: string;
}

// ============================================================================
// CONFIGURACIÓN DE SITUACIÓN
// ============================================================================

/**
 * Configuration for each situation type
 * Defines which activities are beneficial/avoided and keywords for detection
 */
export interface SituationConfig {
  beneficial: string[];
  avoid: string[];
  keywords: string[];
  description: string;
}

/**
 * Map of situation types to their configurations
 */
export type SituationConfigMap = Record<string, SituationConfig>;

// ============================================================================
// SUPABASE / DATABASE
// ============================================================================

/**
 * Raw product data from Supabase
 * Some fields may be null depending on the data source
 */
export interface SupabaseProduct {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_desde: number | null;
  subcategoria: string | null;
  categoria_principal: string | null;
  url: string | null;
  profile_tags: string[] | null;
  situation_tags: string[] | null;
  created_at: string | null;
}

/**
 * Convert Supabase row to Product type with defaults
 */
export function normalizeProduct(raw: SupabaseProduct): Product {
  return {
    id: String(raw.id),
    nombre: raw.nombre,
    descripcion: raw.descripcion || '',
    precio_desde: raw.precio_desde || 0,
    subcategoria: raw.subcategoria || 'General',
    categoria_principal: raw.categoria_principal || 'Otros',
    url: raw.url || '',
    profile_tags: raw.profile_tags || [],
    situation_tags: raw.situation_tags || [],
    created_at: raw.created_at || undefined,
  };
}

// ============================================================================
// WELLNESS REQUEST SYSTEM (for database)
// ============================================================================

/**
 * Wellness request stored in database
 * Represents an employee's wellness recommendation awaiting HR approval
 */
export interface WellnessRequest {
  id: string;
  
  // Anonymous employee identifier
  anonymous_token: string;
  
  // Situation classification
  situation_type: string;
  situation_subtype?: string;
  situation_context?: string;
  situation_confidence?: number;
  
  // User profile snapshot
  profile_snapshot: Profile;
  
  // Chat transcript excerpt
  transcript_excerpt?: string;
  
  // Recommended product
  recommended_product_id: string;
  recommended_product_name: string;
  recommended_product_price: number;
  recommended_product_category?: string;
  recommended_product_subcategory?: string;
  
  // Full product snapshot
  product_snapshot: Product;
  
  // Recommendation reasoning
  recommendation_score: number;
  recommendation_reasons: string[];
  
  // Empathic message
  empathic_message?: string;
  
  // Estimated productivity impact
  estimated_productivity_uplift_percent?: number;
  
  // Request status
  status: 'pending' | 'approved' | 'rejected';
  
  // HR decision
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  
  // Budget tracking
  budget_allocated?: number;
  
  // Metadata
  created_at: string;
  updated_at?: string;
}

/**
 * Admin budget tracking
 */
export interface AdminBudget {
  id: string;
  period_start: string;
  period_end: string;
  total_budget: number;
  allocated_budget: number;
  spent_budget: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Employee notification after approval
 */
export interface EmployeeNotification {
  id: string;
  wellness_request_id: string;
  anonymous_token: string;
  title: string;
  message: string;
  intervention_details: Product;
  delivered: boolean;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// API TYPES (for Next.js API routes)
// ============================================================================

/**
 * Request body for recommendation API
 */
export interface RecommendationRequest {
  transcript: string;
  profile: Profile;
  anonymousToken?: string;
}

/**
 * Request body for creating wellness request
 */
export interface CreateWellnessRequestInput {
  anonymousToken: string;
  situation: Situation;
  profile: Profile;
  topRecommendation: ScoredProduct;
  empathicMessage: string;
  transcriptExcerpt?: string;
}

/**
 * Request body for HR accept/reject API
 */
export interface HRDecisionRequest {
  requestId: string;
  decision: 'approve' | 'reject';
  reason?: string;
  adminUserId: string;
}

/**
 * Request body for updating budget
 */
export interface UpdateBudgetRequest {
  periodStart: string;
  periodEnd: string;
  totalBudget: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
