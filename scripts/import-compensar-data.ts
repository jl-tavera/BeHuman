/**
 * Import Compensar Data to Supabase
 * 
 * Reads compensar-products.json and imports to Compensar-Database table
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfqvhtalwdoxpiqchuxc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcXZodGFsd2RveHBpcWNodXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjMwMDMsImV4cCI6MjA4MDYzOTAwM30.X2IcMxWbF54fALebzFAlck-dynw_2rdJCRaBFXRzX7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CompensarProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio_desde: number;
  categoria_principal: string;
  subcategoria: string;
  url: string;
  imagen_url?: string;
  disponible: boolean;
  scraped_at: string;
}

async function createTableIfNotExists() {
  console.log('🔧 Ensuring Compensar-Database table exists...');
  
  // Note: This requires service role key, which you might not have set
  // If this fails, you'll need to create the table manually in Supabase
  try {
    const { error } = await supabase.rpc('create_compensar_table_if_not_exists');
    if (error && !error.message.includes('already exists')) {
      console.warn('⚠️  Could not auto-create table. Please create manually in Supabase:');
      console.log(`
CREATE TABLE IF NOT EXISTS "Compensar-Database" (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  precio_desde integer DEFAULT 0,
  categoria_principal text,
  subcategoria text,
  url text,
  imagen_url text,
  disponible boolean DEFAULT true,
  scraped_at timestamptz DEFAULT now(),
  situation_tags text[],
  profile_tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
      `);
    }
  } catch (error) {
    // Table creation will be handled manually
  }
}

async function importProducts(filename: string = 'compensar-products.json'): Promise<void> {
  try {
    console.log(`📂 Reading data from ${filename}...`);
    
    const fileContent = await fs.readFile(filename, 'utf-8');
    const products: CompensarProduct[] = JSON.parse(fileContent);
    
    if (!products || products.length === 0) {
      throw new Error('No products found in file');
    }
    
    console.log(`📊 Found ${products.length} products to import`);
    
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('Compensar-Database')
      .delete()
      .neq('id', ''); // Delete all
      
    if (deleteError) {
      console.warn('⚠️  Could not clear existing data:', deleteError.message);
    }
    
    // Insert in batches of 50 to avoid size limits
    const batchSize = 50;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`📤 Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} items)...`);
      
      const { data, error } = await supabase
        .from('Compensar-Database')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} imported successfully`);
      }
    }
    
    console.log('\n📈 Import Summary:');
    console.log(`✅ Successfully imported: ${imported} products`);
    console.log(`❌ Failed: ${failed} products`);
    console.log(`📊 Total processed: ${products.length} products\n`);
    
    if (imported > 0) {
      console.log('🎉 Import completed successfully!');
      console.log('\n🔗 Next steps:');
      console.log('1. Verify data in Supabase dashboard');
      console.log('2. Run tag assignment: npm run fix-tags --update');
      console.log('3. Test recommendations: npm run test:wellness');
    } else {
      console.log('💥 Import failed. Check Supabase connection and table permissions.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if compensar-products.json exists');
    console.log('2. Verify Supabase connection in .env.local');
    console.log('3. Ensure Compensar-Database table exists');
    process.exit(1);
  }
}

async function verifyImport(): Promise<void> {
  console.log('🔍 Verifying import...');
  
  const { data, error, count } = await supabase
    .from('Compensar-Database')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }
  
  console.log(`✅ Found ${count} total products in database`);
  
  if (data && data.length > 0) {
    console.log('\n📄 Sample products:');
    data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre} - $${product.precio_desde} (${product.categoria_principal})`);
    });
  }
  
  console.log('\n🏷️  Tag status:');
  const { data: taggedData } = await supabase
    .from('Compensar-Database')
    .select('situation_tags, profile_tags')
    .not('situation_tags', 'is', null)
    .limit(1);
    
  if (taggedData && taggedData.length > 0) {
    console.log('✅ Products already have tags');
  } else {
    console.log('⚠️  Products need tags. Run: npm run fix-tags --update');
  }
}

// CLI interface
async function main() {
  console.log('📦 Compensar Data Importer for BeHuman\n');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'import';
  
  try {
    if (command === 'verify') {
      await verifyImport();
    } else {
      await createTableIfNotExists();
      await importProducts();
      await verifyImport();
    }
  } catch (error) {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { importProducts, verifyImport };