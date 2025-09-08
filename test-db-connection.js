#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Tests Supabase database connectivity using service_role JWT token
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gadedbrnqzpfqtsdfzcg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZGVkYnJucXpwZnF0c2RmemNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjU2NjExNSwiZXhwIjoyMDU4MTQyMTE1fQ.8tJswPmNq0inajAtfMK6nINr-WQwE_vVJO13Aqf70-w';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...');
  console.log('==========================================');

  try {
    // Test basic connection
    console.log('📡 Testing basic connectivity...');
    const { data, error } = await supabase.from('personalization_tokens').select('count').limit(1);

    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful!');

    // Test table existence
    console.log('\n📋 Checking table structure...');
    const tables = [
      'personalization_tokens',
      'generated_images',
      'user_projects',
      'project_images',
      'reference_images',
      'user_fonts',
      'generated_videos',
      'api_usage',
      'user_preferences'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error && !error.message.includes('permission denied')) {
          console.log(`❌ Table '${table}' may not exist:`, error.message);
        } else {
          console.log(`✅ Table '${table}' is accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }

    console.log('\n🎉 Database test completed!');
    console.log('Note: Some tables may show permission errors if RLS is enabled - this is normal.');

    return true;

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
}

// Run the test
testConnection().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});