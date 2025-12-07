/**
 * Script to fix tags in Compensar-Database
 * 
 * This script:
 * 1. Fetches all products from Compensar-Database
 * 2. Analyzes each product's name, description, and category
 * 3. Assigns appropriate situation_tags (the 4 main situations)
 * 4. Assigns appropriate profile_tags (age, hobbies, goals)
 * 5. Updates the database
 * 
 * PROFILE_TAGS Structure:
 * - Age: joven (18-30) | adulto (30-50) | mayor (50+)
 * - Hobbies: tech, musica, deportes, arte, lectura, cocina, viajes, naturaleza, manualidades, social
 * - Goals: familia, amigos, bienes, carrera, salud, crecimiento_personal, estabilidad
 * 
 * SITUATION_TAGS Structure (4 main categories):
 * - muerte_familiar: Calming, healing, introspective activities
 * - causa_economica: Educational, career growth, affordable options
 * - bloqueo_incapacidad: Learning, mentoring, skill-building
 * - rompimiento_pareja: Social, active, fun, distracting
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfqvhtalwdoxpiqchuxc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcXZodGFsd2RveHBpcWNodXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjMwMDMsImV4cCI6MjA4MDYzOTAwM30.X2IcMxWbF54fALebzFAlck-dynw_2rdJCRaBFXRzX7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Product {
  id?: string;
  nombre: string;
  descripcion?: string;
  categoria_principal?: string;
  subcategoria?: string;
  precio_desde?: number;
  precio_hasta?: number;
  profile_tags?: string[];
  situation_tags?: string[];
}

// ============================================================================
// SITUATION TAG INFERENCE - Which of 4 situations does this help with?
// ============================================================================

/**
 * Determines which situation_tags apply to a product
 * Based on therapeutic benefits of the activity
 */
function inferSituationTags(product: Product): string[] {
  const text = `${product.nombre} ${product.descripcion || ''} ${product.categoria_principal || ''} ${product.subcategoria || ''}`.toLowerCase();
  const tags: string[] = [];

  // ========== MUERTE_FAMILIAR ==========
  // Calm, introspective, healing, emotional processing
  if (
    text.includes('yoga') ||
    text.includes('meditación') ||
    text.includes('mindfulness') ||
    text.includes('spa') ||
    text.includes('relajación') ||
    text.includes('massage') ||
    text.includes('masaje') ||
    text.includes('terapia') ||
    text.includes('psicología') ||
    text.includes('psicólog') ||
    text.includes('art therapy') ||
    text.includes('arteterapia') ||
    text.includes('music therapy') ||
    text.includes('musicoterapia') ||
    text.includes('retiro') ||
    text.includes('wellness') ||
    text.includes('holístico') ||
    text.includes('acupuntura') ||
    text.includes('reiki') ||
    (text.includes('música') && (text.includes('tranquilo') || text.includes('relajante'))) ||
    (text.includes('naturaleza') && (text.includes('camina') || text.includes('excursión'))) ||
    text.includes('horticultura') ||
    text.includes('flores')
  ) {
    tags.push('muerte_familiar');
  }

  // ========== CAUSA_ECONOMICA ==========
  // Educational, career advancement, financial literacy, affordable/free
  if (
    text.includes('curso') ||
    text.includes('capacitación') ||
    text.includes('educación') ||
    text.includes('educativo') ||
    text.includes('aprendizaje') ||
    text.includes('formación') ||
    text.includes('entrenamiento') ||
    text.includes('workshop') ||
    text.includes('webinar') ||
    text.includes('seminario') ||
    text.includes('taller') ||
    text.includes('emprendimiento') ||
    text.includes('startup') ||
    text.includes('negocio') ||
    text.includes('carrera') ||
    text.includes('empleo') ||
    text.includes('trabajo') ||
    text.includes('laboral') ||
    text.includes('habilidad') ||
    text.includes('skill') ||
    text.includes('profesional') ||
    text.includes('asesoría') ||
    text.includes('consultoría') ||
    text.includes('mentor') ||
    text.includes('coaching') ||
    text.includes('finanzas') ||
    text.includes('financiera') ||
    text.includes('presupuesto') ||
    text.includes('ahorro') ||
    text.includes('inversión') ||
    text.includes('gratis') ||
    text.includes('gratuito') ||
    text.includes('económico') ||
    text.includes('asequible') ||
    text.includes('tech') ||
    text.includes('tecnología') ||
    text.includes('programación') ||
    text.includes('código')
  ) {
    tags.push('causa_economica');
  }

  // ========== BLOQUEO_INCAPACIDAD ==========
  // Building confidence, overcoming fear, learning basics, mentorship
  if (
    text.includes('aprender') ||
    text.includes('aprendizaje') ||
    text.includes('curso') ||
    text.includes('introducción') ||
    text.includes('fundamentos') ||
    text.includes('básico') ||
    text.includes('principiante') ||
    text.includes('iniciante') ||
    text.includes('mentoría') ||
    text.includes('mentor') ||
    text.includes('coaching') ||
    text.includes('desarrollo personal') ||
    text.includes('crecimiento') ||
    text.includes('autoestima') ||
    text.includes('confianza') ||
    text.includes('transformación') ||
    text.includes('superar') ||
    text.includes('reto') ||
    text.includes('desafío') ||
    text.includes('logro') ||
    text.includes('éxito') ||
    text.includes('apoyo emocional') ||
    text.includes('psicología') ||
    text.includes('asesoría personal') ||
    text.includes('competencia')
  ) {
    tags.push('bloqueo_incapacidad');
  }

  // ========== ROMPIMIENTO_PAREJA ==========
  // Social activities, physical exercise, fun, distraction, group activities
  if (
    text.includes('deporte') ||
    text.includes('deportivo') ||
    text.includes('fútbol') ||
    text.includes('basketball') ||
    text.includes('tenis') ||
    text.includes('golf') ||
    text.includes('voleibol') ||
    text.includes('natación') ||
    text.includes('ciclismo') ||
    text.includes('atletismo') ||
    text.includes('cross fit') ||
    text.includes('crossfit') ||
    text.includes('gym') ||
    text.includes('fitness') ||
    text.includes('entrenamiento') ||
    text.includes('ejercicio') ||
    text.includes('actividad física') ||
    text.includes('team building') ||
    text.includes('team') ||
    text.includes('equipo') ||
    text.includes('grupo') ||
    text.includes('social') ||
    text.includes('evento') ||
    text.includes('fiesta') ||
    text.includes('baile') ||
    text.includes('danza') ||
    text.includes('concierto') ||
    text.includes('música') ||
    text.includes('viaje') ||
    text.includes('turismo') ||
    text.includes('excursión') ||
    text.includes('aventura') ||
    text.includes('camping') ||
    text.includes('amigos') ||
    text.includes('diversión') ||
    text.includes('entretenimiento') ||
    text.includes('recreación')
  ) {
    tags.push('rompimiento_pareja');
  }

  // If no tags matched, assign general ones based on category
  if (tags.length === 0) {
    if (product.categoria_principal?.toLowerCase().includes('educación') ||
        product.categoria_principal?.toLowerCase().includes('capacitación')) {
      tags.push('causa_economica', 'bloqueo_incapacidad');
    } else if (product.categoria_principal?.toLowerCase().includes('deporte') ||
               product.categoria_principal?.toLowerCase().includes('bienestar')) {
      tags.push('rompimiento_pareja', 'muerte_familiar');
    } else {
      tags.push('bloqueo_incapacidad', 'causa_economica');
    }
  }

  return Array.from(new Set(tags));
}

// ============================================================================
// PROFILE TAG INFERENCE - Age, hobbies, goals
// ============================================================================

function inferProfileTags(product: Product): string[] {
  const text = `${product.nombre} ${product.descripcion || ''} ${product.categoria_principal || ''} ${product.subcategoria || ''}`.toLowerCase();
  const tags: string[] = [];

  // ========== AGE CATEGORIES ==========
  
  const isYouthSpecific = 
    text.includes('gaming') || text.includes('videojuego') || text.includes('gamer') ||
    text.includes('esports') || text.includes('deporte extremo') || text.includes('parkour') ||
    text.includes('skate') || text.includes('dron') || text.includes('vr') ||
    text.includes('realidad virtual') || text.includes('redes sociales') ||
    text.includes('influencer') || text.includes('tiktok') || text.includes('trending');

  const isAdultSpecific =
    text.includes('profesional') || text.includes('ejecutivo') || text.includes('liderazgo') ||
    text.includes('dirección') || text.includes('carrera ejecutiva') || text.includes('familia') ||
    text.includes('padre') || text.includes('madre') || text.includes('responsabilidad') ||
    text.includes('balance') || text.includes('work-life') || text.includes('vino') ||
    text.includes('golf') || text.includes('gourmet');

  const isSeniorSpecific =
    text.includes('senior') || text.includes('mayor') || text.includes('tercera edad') ||
    text.includes('jubilado') || text.includes('retiro') || text.includes('50+') ||
    text.includes('abuelo') || text.includes('sabiduria') || text.includes('experiencia') ||
    text.includes('bajo impacto');

  if (isYouthSpecific) tags.push('joven');
  if (isAdultSpecific || (!isYouthSpecific && !isSeniorSpecific)) tags.push('adulto');
  if (isSeniorSpecific || text.includes('todas edades') || text.includes('cualquier edad')) tags.push('mayor');
  if (tags.filter(t => ['joven', 'adulto', 'mayor'].includes(t)).length === 0) {
    tags.push('joven', 'adulto');
  }

  // ========== HOBBY TAGS ==========
  
  if (text.match(/tech|tecnología|programación|código|computador|software|digital|coding|desarrollo|app/)) tags.push('tech');
  if (text.match(/música|musical|concierto|canto|canta|voz|instrumento|banda|jazz|clásico|rock|pop/)) tags.push('musica');
  if (text.match(/deporte|deportivo|ejercicio|gym|fitness|entrenamiento|fútbol|basketball|tenis|voleibol|natación|atletismo|ciclismo|running/)) tags.push('deportes');
  if (text.match(/arte|pintura|dibujo|escultura|galería|artístico|creativo/)) tags.push('arte');
  if (text.match(/lectura|libro|leer|literatura|novela|autor/)) tags.push('lectura');
  if (text.match(/cocina|culinaria|gastronom|chef|receta|gourmet/)) tags.push('cocina');
  if (text.match(/viaje|turismo|excursión|tour|destino|viajero/)) tags.push('viajes');
  if (text.match(/naturaleza|aire libre|outdoor|camping|montaña|parque|sendero|verde/)) tags.push('naturaleza');
  if (text.match(/manualidad|craft|diy|artesanía/)) tags.push('manualidades');
  if (text.match(/social|grupo|amigos|team|evento|encuentro|reunión/)) tags.push('social');

  // ========== GOAL TAGS ==========
  
  if (text.match(/familia|familiar|padre|madre|hijo/)) tags.push('familia');
  if (text.match(/amigo|amigos|amistad|conexión|comunidad/)) tags.push('amigos');
  if (text.match(/carrera|profesional|trabajo|empleo|laboral|empresario/)) tags.push('carrera');
  if (text.match(/salud|bienestar|wellness|fitness|medicina|nutrición/)) tags.push('salud');
  if (text.match(/crecimiento personal|desarrollo personal|transformación|educación|mejora|superación/)) tags.push('crecimiento_personal');
  if (text.match(/estabilidad|seguridad|paz|tranquilidad|equilibrio/)) tags.push('estabilidad');
  if (text.match(/bienes|casa|propiedad|inmueble|vivienda/)) tags.push('bienes');

  return Array.from(new Set(tags));
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

async function updateAllProductTags() {
  console.log('🔧 Fixing tags in Compensar-Database...\n');

  try {
    console.log('📥 Fetching all products...');
    const { data: products, error: fetchError } = await supabase
      .from('Compensar-Database')
      .select('*');

    if (fetchError) throw fetchError;
    if (!products || products.length === 0) {
      console.log('⚠️  No products found in database');
      return;
    }

    console.log(`✅ Found ${products.length} products\n`);

    let updated = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const situationTags = inferSituationTags(product);
        const profileTags = inferProfileTags(product);

        console.log(`📦 ${product.nombre}`);
        console.log(`   Situation Tags: ${situationTags.join(', ')}`);
        console.log(`   Profile Tags: ${profileTags.join(', ')}`);

        const { error: updateError } = await supabase
          .from('Compensar-Database')
          .update({
            situation_tags: situationTags,
            profile_tags: profileTags
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`   ❌ Error: ${updateError.message}`);
          failed++;
        } else {
          console.log(`   ✅ Updated`);
          updated++;
        }
        console.log('');

      } catch (error) {
        console.error(`   ❌ Failed to process: ${error}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully updated: ${updated} products`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} products`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// PREVIEW FUNCTION
// ============================================================================

async function previewTagChanges() {
  console.log('👀 Previewing tag changes for first 10 products...\n');

  try {
    const { data: products, error } = await supabase
      .from('Compensar-Database')
      .select('*')
      .limit(10);

    if (error) throw error;
    if (!products || products.length === 0) {
      console.log('⚠️  No products found');
      return;
    }

    for (const product of products) {
      const situationTags = inferSituationTags(product);
      const profileTags = inferProfileTags(product);

      console.log(`📦 ${product.nombre}`);
      console.log(`   Category: ${product.categoria_principal} > ${product.subcategoria}`);
      console.log(`   NEW situation_tags: ${situationTags.join(', ')}`);
      console.log(`   NEW profile_tags: ${profileTags.join(', ')}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// RUN
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--preview')) {
  previewTagChanges();
} else if (args.includes('--update')) {
  updateAllProductTags();
} else {
  console.log(`
🔧 Compensar Database Tag Fixer

Usage:
  npx ts-node Typescript-Integration/fix-tags.ts --preview   # Preview first 10 products
  npx ts-node Typescript-Integration/fix-tags.ts --update    # Update ALL products

Tags assigned:
  SITUATION_TAGS (which 4 situations help with):
    - muerte_familiar (calming, healing, terapeutic)
    - causa_economica (educational, career, affordable)
    - bloqueo_incapacidad (learning, mentoring, confidence)
    - rompimiento_pareja (social, active, fun, distracting)

  PROFILE_TAGS (age, hobbies, goals):
    - Age: joven (18-30) | adulto (30-50) | mayor (50+)
    - Hobbies: tech, musica, deportes, arte, lectura, cocina, viajes, naturaleza, manualidades, social
    - Goals: familia, amigos, carrera, salud, crecimiento_personal, estabilidad, bienes
  `);
}
