/**
 * Helper functions to convert onboarding data to Profile for recommendations
 */

import type { OnboardingProfile } from '@/types/onboarding';
import type { Profile, AgeCategory } from './types';

/**
 * Converts onboarding profile to recommendation Profile
 */
export function onboardingToProfile(onboarding: OnboardingProfile): Profile {
  // Parse age from string (e.g., "18-25" -> 21 average)
  let age: number | undefined;
  let ageCategory: AgeCategory | undefined;
  
  if (onboarding.human_age) {
    // Handle age ranges like "18-25", "26-35", etc.
    const ageMatch = onboarding.human_age.match(/(\d+)/);
    if (ageMatch) {
      const ageNum = parseInt(ageMatch[1]);
      age = ageNum;
      
      // Classify age category
      if (ageNum < 30) {
        ageCategory = 'joven';
      } else if (ageNum < 50) {
        ageCategory = 'adulto';
      } else {
        ageCategory = 'mayor';
      }
    }
  }

  // Combine all goals from different sources
  const goals = [
    ...(onboarding.life_axes || []),
    ...(onboarding.short_term_goals || []),
    ...(onboarding.ten_year_goals || [])
  ];

  // Normalize goals to match GoalTag types
  const normalizedGoals = goals.map(goal => {
    const g = goal.toLowerCase();
    if (g.includes('familia')) return 'familia';
    if (g.includes('amigo')) return 'amigos';
    if (g.includes('bien') || g.includes('dinero') || g.includes('casa')) return 'bienes';
    if (g.includes('carrera') || g.includes('trabajo') || g.includes('profesional')) return 'carrera';
    if (g.includes('salud') || g.includes('ejercicio') || g.includes('deporte')) return 'salud';
    if (g.includes('personal') || g.includes('crecer') || g.includes('aprender')) return 'crecimiento_personal';
    if (g.includes('estabilidad') || g.includes('seguridad')) return 'estabilidad';
    return goal; // Keep original if no match
  });

  // Normalize hobbies to match HobbyTag types
  const normalizedHobbies = (onboarding.hobbies || []).map(hobby => {
    const h = hobby.toLowerCase();
    if (h.includes('tech') || h.includes('tecnología') || h.includes('programar')) return 'tech';
    if (h.includes('música') || h.includes('music')) return 'musica';
    if (h.includes('deporte') || h.includes('sport') || h.includes('ejercicio')) return 'deportes';
    if (h.includes('arte') || h.includes('pintar') || h.includes('dibujar')) return 'arte';
    if (h.includes('leer') || h.includes('lectura') || h.includes('libro')) return 'lectura';
    if (h.includes('cocina') || h.includes('cocinar')) return 'cocina';
    if (h.includes('viaje') || h.includes('viajar') || h.includes('travel')) return 'viajes';
    if (h.includes('naturaleza') || h.includes('aire libre') || h.includes('outdoor')) return 'naturaleza';
    if (h.includes('manualidad') || h.includes('craft') || h.includes('diy')) return 'manualidades';
    if (h.includes('social') || h.includes('amigos') || h.includes('fiesta')) return 'social';
    return hobby; // Keep original if no match
  });

  return {
    userId: onboarding.user_id,
    name: onboarding.human_name,
    age,
    ageCategory,
    gender: onboarding.human_gender,
    hobbies: normalizedHobbies,
    goals: Array.from(new Set(normalizedGoals)), // Remove duplicates
    emotionalHistory: onboarding.emotional_history || undefined
  };
}

/**
 * Fetches onboarding profile and converts to Profile
 */
export async function getProfileFromOnboarding(userId: string): Promise<Profile | null> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('onboarding_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching onboarding profile:', error);
      return null;
    }

    return onboardingToProfile(data as OnboardingProfile);
  } catch (error) {
    console.error('Error getting profile from onboarding:', error);
    return null;
  }
}
