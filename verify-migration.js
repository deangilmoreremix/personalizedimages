#!/usr/bin/env node

/**
 * Quick Migration Verification Script
 * Run this to quickly check if the database migration was successful
 */

import { supabase } from './src/utils/supabaseClient.js';

async function verifyMigration() {
  console.log('🔍 Verifying Database Migration...');
  console.log('=====================================');

  const checks = [
    { name: 'Database Connection', test: testConnection },
    { name: 'User Profiles Table', test: () => testTable('user_profiles') },
    { name: 'Personalization Tokens Table', test: () => testTable('personalization_tokens') },
    { name: 'Generated Images Table', test: () => testTable('generated_images') },
    { name: 'User Projects Table', test: () => testTable('user_projects') },
    { name: 'Reference Images Table', test: () => testTable('reference_images') },
    { name: 'API Usage Table', test: () => testTable('api_usage') },
    { name: 'User Fonts Table', test: () => testTable('user_fonts') },
    { name: 'Generated Videos Table', test: () => testTable('generated_videos') },
    { name: 'User Preferences Table', test: () => testTable('user_preferences') },
    { name: 'Row Level Security', test: testRLS }
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      console.log(`\n📋 Testing: ${check.name}`);
      const result = await check.test();
      console.log(`✅ ${check.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Verification Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 Migration verification successful!');
    console.log('Your database schema is ready for use.');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.');
    console.log('You may need to re-run the migration or check your permissions.');
  }
}

async function testConnection() {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) throw error;
    return 'Connected successfully';
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`);
  }
}

async function testTable(tableName) {
  try {
    // Try to get table info (this will fail if table doesn't exist or RLS blocks it)
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
      // If it's an RLS error, that's actually good - means table exists
      if (error.message.includes('permission denied') ||
          error.message.includes('violates row-level security')) {
        return 'Table exists with RLS enabled';
      }
      throw error;
    }

    return 'Table exists and accessible';
  } catch (error) {
    throw new Error(`Table check failed: ${error.message}`);
  }
}

async function testRLS() {
  try {
    // Try to query without auth - should be blocked by RLS
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);

    if (error && (error.message.includes('permission denied') ||
                  error.message.includes('violates row-level security'))) {
      return 'RLS policies are active and working';
    }

    // If no error, RLS might not be enabled
    return 'RLS may not be properly configured';
  } catch (error) {
    throw new Error(`RLS check failed: ${error.message}`);
  }
}

// Handle ES modules in Node.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Fallback for CommonJS if needed
try {
  verifyMigration().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Script execution error:', error);
  process.exit(1);
}