/**
 * Script to fix tags in Compensar-Database
 * 
 * This script:
 * 1. Fetches all products from Compensar-Database
 * 2. Analyzes each product's name, description, and category
 * 3. Assigns appropriate situation_tags (the 4 main situations)
 * 4. Assigns appropriate profile_tags (age, hobbies, goals)
 * 5. Updates the database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfqvhtalwdoxpiqchuxc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcXZodGFsd2RveHBpcWNodXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjMwMDMsImV4cCI6MjA4MDYzOTAwM30.X2IcMxWbF54fALebzFAlck-dynw_2rdJCRaBFXRzX7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TAG INFERENCE RULES
// ============================================================================

/**
 * Determines which situation_tags apply to a product
 * Products can have multiple situation tags if applicable
 */
function inferSituationTags(product: any): string[] {
  const text = `${product.nombre} ${product.descripcion || ''} ${product.categoria_principal || ''} ${product.subcategoria || ''}`.toLowerCase();
  const tags: string[] = [];

  // MUERTE_FAMILIAR - Calming, introspective, healing activities
  if (
    text.includes('música') ||
    text.includes('meditación') ||
    text.includes('yoga') ||
    text.includes('spa') ||
    text.includes('relax') ||
    text.includes('naturaleza') ||
    text.includes('arte') ||
    text.includes('terapia') ||
    text.includes('mindfulness') ||
    text.includes('tranquil') ||
    text.includes('paz') ||
    text.includes('calm')
  ) {
    tags.push('muerte_familiar');
  }

  // CAUSA_ECONOMICA - Educational, career development, affordable
  if (
    text.includes('curso') ||
    text.includes('taller') ||
    text.includes('capacitación') ||
    text.includes('educación') ||
    text.includes('aprendizaje') ||
    text.includes('formación') ||
    text.includes('emprendimiento') ||
    text.includes('negocio') ||
    text.includes('tech') ||
    text.includes('tecnología') ||
    text.includes('habilidad') ||
    text.includes('carrera') ||
    text.includes('gratis') ||
    text.includes('económico') ||
    text.includes('asesoría')
  ) {
    tags.push('causa_economica');
  }

  // BLOQUEO_INCAPACIDAD - Learning, mentoring, skill-building
  if (
    text.includes('curso') ||
    text.includes('aprender') ||
    text.includes('taller') ||
    text.includes('mentoría') ||
    text.includes('asesoría') ||
    text.includes('coaching') ||
    text.includes('desarrollo personal') ||
    text.includes('crecimiento') ||
    text.includes('habilidad') ||
    text.includes('básico') ||
    text.includes('principiante') ||
    text.includes('introducción') ||
    text.includes('fundamentos')
  ) {
    tags.push('bloqueo_incapacidad');
  }

  // ROMPIMIENTO_PAREJA - Social, active, fun, distracting
  if (
    text.includes('deporte') ||
    text.includes('team') ||
    text.includes('equipo') ||
    text.includes('grupo') ||
    text.includes('social') ||
    text.includes('fiesta') ||
    text.includes('baile') ||
    text.includes('amigos') ||
    text.includes('aventura') ||
    text.includes('viaje') ||
    text.includes('activ') ||
    text.includes('diversión') ||
    text.includes('entretenimiento')
  ) {
    tags.push('rompimiento_pareja');
  }

  // If no tags matched, assign most general ones
  if (tags.length === 0) {
    tags.push('bloqueo_incapacidad', 'causa_economica');
  }

  return Array.from(new Set(tags)); // Remove duplicates
}

/**
 * Determines profile_tags for a product
 * Includes: age categories + hobby/activity types
 */
function inferProfileTags(product: any): string[] {
  const text = `${product.nombre} ${product.descripcion || ''} ${product.categoria_principal || ''} ${product.subcategoria || ''}`.toLowerCase();
  const tags: string[] = [];

  // AGE CATEGORIES - Assign based on activity type
  const isYouthActivity = 
    text.includes('deporte extremo') ||
    text.includes('gaming') ||
    text.includes('videojuego') ||
    text.includes('fiesta') ||
    text.includes('baile') ||
    text.includes('tecnología') ||
    text.includes('redes sociales');

  const isAdultActivity =
    text.includes('profesional') ||
    text.includes('carrera') ||
    text.includes('negocio') ||
    text.includes('vino') ||
    text.includes('cocina gourmet') ||
    text.includes('golf');

  const isSeniorActivity =
    text.includes('senior') ||
    text.includes('mayor') ||
    text.includes('tercera edad') ||
    text.includes('retiro') ||
    text.includes('relajación');

  // Assign age categories
  if (isYouthActivity || (!isAdultActivity && !isSeniorActivity)) {
    tags.push('joven'); // 18-30
  }
  if (!isSeniorActivity) {
    tags.push('adulto'); // 30-50
  }
  if (isSeniorActivity || text.includes('todas las edades')) {
    tags.push('mayor'); // 50+
  }

  // HOBBY/ACTIVITY TAGS
  if (text.includes('tech') || text.includes('tecnología') || text.includes('programación') || text.includes('computador')) {
    tags.push('tech');
  }
  if (text.includes('música') || text.includes('concierto') || text.includes('canto')) {
    tags.push('musica');
  }
  if (text.includes('deporte') || text.includes('ejercicio') || text.includes('gym') || text.includes('fitness') || text.includes('fútbol') || text.includes('basketball')) {
    tags.push('deportes');
  }
  if (text.includes('arte') || text.includes('pintura') || text.includes('dibujo') || text.includes('manualidad')) {
    tags.push('arte');
  }
  if (text.includes('lectura') || text.includes('libro') || text.includes('leer')) {
    tags.push('lectura');
  }
  if (text.includes('cocina') || text.includes('culinaria') || text.includes('gastronom')) {
    tags.push('cocina');
  }
  if (text.includes('viaje') || text.includes('turismo') || text.includes('excursión')) {
    tags.push('viajes');
  }
  if (text.includes('naturaleza') || text.includes('aire libre') || text.includes('outdoor') || text.includes('camping')) {
    tags.push('naturaleza');
  }
  if (text.includes('manualidad') || text.includes('craft') || text.includes('diy')) {
    tags.push('manualidades');
  }
  if (text.includes('social') || text.includes('grupo') || text.includes('amigos') || text.includes('team')) {
    tags.push('social');
  }

  // GOAL-RELATED TAGS
  if (text.includes('familia') || text.includes('familiar')) {
    tags.push('familia');
  }
  if (text.includes('amigo') || text.includes('social')) {
    tags.push('amigos');
  }
  if (text.includes('carrera') || text.includes('profesional') || text.includes('trabajo')) {
    tags.push('carrera');
  }
  if (text.includes('salud') || text.includes('bienestar') || text.includes('wellness')) {
    tags.push('salud');
  }
  if (text.includes('crecimiento') || text.includes('desarrollo personal') || text.includes('autoayuda')) {
    tags.push('crecimiento_personal');
  }

  // ACTIVITY CHARACTERISTICS
  if (text.includes('tranquil') || text.includes('relax') || text.includes('calm') || text.includes('paz')) {
    tags.push('tranquilo');
  }
  if (text.includes('activ') || text.includes('dinámico') || text.includes('energía')) {
    tags.push('activo');
  }
  if (text.includes('creativ') || text.includes('arte') || text.includes('expresión')) {
    tags.push('creativo');
  }

  return Array.from(new Set(tags)); // Remove duplicates
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

async function updateAllProductTags() {
  console.log('🔧 Fixing tags in Compensar-Database...\n');

  try {
    // 1. Fetch all products
    console.log('📥 Fetching all products...');
    const { data: products, error: fetchError } = await supabase
      .from('Compensar-Database')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found in database');
      return;
    }

    console.log(`✅ Found ${products.length} products\n`);

    // 2. Update each product
    let updated = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const situationTags = inferSituationTags(product);
        const profileTags = inferProfileTags(product);

        console.log(`📦 ${product.nombre}`);
        console.log(`   Situation Tags: ${situationTags.join(', ')}`);
        console.log(`   Profile Tags: ${profileTags.join(', ')}`);

        // Update the product
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
// PREVIEW FUNCTION (Don't update, just show what would change)
// ============================================================================

async function previewTagChanges() {
  console.log('👀 Previewing tag changes (no updates will be made)...\n');

  try {
    const { data: products, error } = await supabase
      .from('Compensar-Database')
      .select('*')
      .limit(10); // Preview first 10 products

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
      console.log(`   Current situation_tags: ${product.situation_tags || 'none'}`);
      console.log(`   NEW situation_tags: ${situationTags.join(', ')}`);
      console.log(`   Current profile_tags: ${product.profile_tags || 'none'}`);
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
  npm run fix-tags:preview   # Preview changes without updating
  npm run fix-tags:update    # Update all products

Or:
  npx ts-node Typescript-Integration/fix-tags.ts --preview
  npx ts-node Typescript-Integration/fix-tags.ts --update
  `);
}
