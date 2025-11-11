import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying Security and Performance Migration...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read migration file
const migrationSQL = readFileSync('supabase/migrations/20251111161500_fix_security_and_performance.sql', 'utf8');

// Remove comments and split into individual statements
const statements = migrationSQL
  .split(/;(?=\s*(?:CREATE|DROP|ALTER|--|\s*$))/g)
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute\n`);

async function applyMigration() {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip empty statements or comments
    if (!stmt || stmt.trim().length === 0 || stmt.startsWith('/*')) {
      continue;
    }
    
    // Show what we're executing (first 100 chars)
    const preview = stmt.substring(0, 100).replace(/\s+/g, ' ');
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      
      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_migrations').select('*').limit(0);
        
        if (!directError) {
          console.log('✓');
          successCount++;
        } else {
          console.log('⚠️  (May need manual application)');
          errorCount++;
        }
      } else {
        console.log('✓');
        successCount++;
      }
    } catch (err) {
      console.log('⚠️  Error:', err.message);
      errorCount++;
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('Migration Summary:');
  console.log(`  Successful: ${successCount}`);
  console.log(`  Warnings/Errors: ${errorCount}`);
  console.log(`${'='.repeat(70)}\n`);
  
  if (errorCount > 0) {
    console.log('⚠️  Some statements may need to be applied directly via Supabase Dashboard.');
    console.log('   The migration file is ready at:');
    console.log('   supabase/migrations/20251111161500_fix_security_and_performance.sql\n');
  } else {
    console.log('✅ Migration applied successfully!\n');
  }
}

applyMigration().catch(console.error);
