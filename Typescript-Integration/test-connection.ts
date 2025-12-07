import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfqvhtalwdoxpiqchuxc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcXZodGFsd2RveHBpcWNodXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjMwMDMsImV4cCI6MjA4MDYzOTAwM30.X2IcMxWbF54fALebzFAlck-dynw_2rdJCRaBFXRzX7g';

console.log('🔌 Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('\n📊 Fetching from Compensar-Database...');
  const { data, error, count } = await supabase
    .from('Compensar-Database')
    .select('*', { count: 'exact' })
    .limit(3);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Total count: ${count}`);
  console.log(`✅ Fetched: ${data?.length} products`);
  console.log('\nFirst product:');
  console.log(JSON.stringify(data?.[0], null, 2));
}

test();
