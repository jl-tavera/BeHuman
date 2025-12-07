/**
 * Example: How to use the wellness recommendation system with onboarding data
 */

import { getProfileFromOnboarding } from './profile-adapter';
import { classifySituation, getRecommendations } from './recommender';

/**
 * Example 1: Get recommendations for a user after they chat
 */
export async function exampleGetRecommendationsFromChat(
  userId: string,
  chatTranscript: string
) {
  // 1. Get user profile from onboarding
  const profile = await getProfileFromOnboarding(userId);
  
  if (!profile) {
    console.error('User has not completed onboarding');
    return null;
  }

  // 2. Classify the situation from chat
  const situation = classifySituation(chatTranscript);

  // 3. Get recommendations (and save to database)
  const anonymousToken = `anon_${userId}_${Date.now()}`;
  
  const result = await getRecommendations(
    profile,
    situation,
    chatTranscript,
    4, // top 4 recommendations
    anonymousToken,
    true // save to database
  );

  return result;
}

/**
 * Example 2: Test cases matching your requirements
 */

// Test Case 1: Muerte familiar + Joven + Le gusta ejercicio + Quiere ser deportista
export const testMuerteFamiliar = {
  onboarding: {
    user_id: 'test-001',
    human_name: 'Carlos',
    human_age: '18-25', // Joven (18-30)
    human_gender: 'masculino',
    hobbies: ['deportes', 'ejercicio', 'música'], // Le gusta ejercicio
    life_axes: ['salud', 'familia'],
    short_term_goals: ['ser deportista'], // Quiere ser deportista
    ten_year_goals: ['carrera deportiva'],
    emotional_history: null
  },
  transcript: `
    Mi abuelo murió la semana pasada. 
    Estoy muy triste y no sé cómo seguir adelante.
    Siempre me apoyó en mi carrera deportiva.
  `
  // Expected: Alter Bridge o música reconfortante + actividades deportivas tranquilas
};

// Test Case 2: Causa económica + Es Navidad + Es Colombiano
export const testCausaEconomicaNavidad = {
  onboarding: {
    user_id: 'test-002',
    human_name: 'María',
    human_age: '26-35', // Adulto
    human_gender: 'femenino',
    hobbies: ['cocina', 'familia'],
    life_axes: ['bienes', 'familia'],
    short_term_goals: ['estabilidad económica'],
    ten_year_goals: ['casa propia'],
    emotional_history: null
  },
  transcript: `
    Estoy en Colombia y se acerca la Navidad.
    No tengo plata para comprar regalos para mi familia.
    Me despidieron del trabajo hace un mes.
    Me siento muy estresada con los gastos de diciembre.
  `
  // Expected: Cursos de capacitación, asesoría financiera, actividades económicas
};

// Test Case 3: Bloqueo por incapacidad + Tech
export const testBloqueIncapacidadTech = {
  onboarding: {
    user_id: 'test-003',
    human_name: 'Juan',
    human_age: '18-25', // Joven
    human_gender: 'masculino',
    hobbies: ['tech', 'programación', 'videojuegos'],
    life_axes: ['carrera'],
    short_term_goals: ['aprender programación'],
    ten_year_goals: ['ser desarrollador'],
    emotional_history: null
  },
  transcript: `
    No entiendo nada de programación.
    Me siento incapaz de aprender.
    Todos mis compañeros entienden y yo no.
    Creo que la tecnología no es para mí.
  `
  // Expected: Asesoría de Freddy Vega, cursos de Platzi, mentoría tech
};

// Test Case 4: Rompimiento de pareja (Tusa) + No hay pesos
export const testTusa = {
  onboarding: {
    user_id: 'test-004',
    human_name: 'Andrea',
    human_age: '18-25', // Joven
    human_gender: 'femenino',
    hobbies: ['música', 'fiestas', 'amigos'],
    life_axes: ['amigos', 'diversión'],
    short_term_goals: ['salir de la tusa'],
    ten_year_goals: ['ser feliz'],
    emotional_history: null
  },
  transcript: `
    Rompí con mi novio hace una semana.
    Estoy en la tusa total.
    No tengo pesos para salir y distraerme.
    Mis amigas quieren que salgamos pero no puedo.
  `
  // Expected: Actividades sociales económicas, música de despecho, eventos gratuitos
};

/**
 * Run all test cases
 */
export async function runTestCases() {
  console.log('🧪 Testing Wellness Recommendation System\n');

  const testCases = [
    { name: 'Muerte Familiar', data: testMuerteFamiliar },
    { name: 'Causa Económica Navidad', data: testCausaEconomicaNavidad },
    { name: 'Bloqueo Tech', data: testBloqueIncapacidadTech },
    { name: 'Tusa (Rompimiento)', data: testTusa }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test Case: ${testCase.name}`);
    console.log('─'.repeat(60));
    
    try {
      // Convert onboarding to profile
      const { onboardingToProfile } = await import('./profile-adapter');
      const profile = onboardingToProfile(testCase.data.onboarding as any);
      
      console.log('✅ Profile:', {
        name: profile.name,
        age: profile.age,
        ageCategory: profile.ageCategory,
        hobbies: profile.hobbies,
        goals: profile.goals
      });

      // Classify situation
      const situation = classifySituation(testCase.data.transcript);
      console.log('✅ Situation:', {
        type: situation.type,
        subtype: situation.subtype,
        confidence: situation.confidence
      });

      // Get recommendations
      const result = await getRecommendations(
        profile,
        situation,
        testCase.data.transcript,
        3,
        `test_${testCase.data.onboarding.user_id}`,
        false // don't save to DB in test
      );

      console.log('✅ Top Recommendation:');
      if (result.recommendations[0]) {
        const top = result.recommendations[0];
        console.log(`   ${top.product.nombre}`);
        console.log(`   Price: $${top.product.precio_desde}`);
        console.log(`   Score: ${top.score}`);
        console.log(`   Reasons: ${top.reasons.slice(0, 2).join(', ')}`);
      }
      
      console.log('\n💬 Empathic Message:');
      console.log(`   "${result.empathicMessage.substring(0, 150)}..."`);

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

// Export for use in other files
export {
  getProfileFromOnboarding,
  classifySituation,
  getRecommendations
};
