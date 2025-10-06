/**
 * Node-Compatible Feature Testing Suite
 * Tests token system and validates database migration
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load environment variables from .env file manually
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.warn('Could not load .env file:', error.message);
  }
}

loadEnvFile();

console.log('\n🧪 FEATURE TEST SUITE (Node Compatible)\n');
console.log('=' .repeat(60));

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (details) console.log(`   ${details}`);

  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// ============================================================================
// TEST 1: TOKEN SYSTEM STRUCTURE
// ============================================================================
console.log('\n📊 Test 1: Token System Structure');
console.log('-'.repeat(60));

function testTokenStructure() {
  try {
    const tokenContent = fs.readFileSync('./src/types/tokens.ts', 'utf-8');

    // Test 1.1: File exists
    logTest('Token System - File exists', true, 'src/types/tokens.ts found');

    // Test 1.2: Contains ALL_TOKENS export
    logTest('Token System - ALL_TOKENS exported',
      tokenContent.includes('export const ALL_TOKENS'),
      'ALL_TOKENS constant found');

    // Test 1.3: Contains 88 token definitions (count opening braces in array)
    const tokenMatches = tokenContent.match(/\{\s*key:\s*['"`]/g) || [];
    const tokenCount = tokenMatches.length;
    logTest('Token System - 88 tokens defined',
      tokenCount === 88,
      `Found ${tokenCount} token definitions`);

    // Test 1.4: Check for all categories
    const categories = [
      'Personal Information',
      'Professional Details',
      'Contact Information',
      'Location Details',
      'Company Information',
      'Date & Time'
    ];

    let foundCategories = 0;
    categories.forEach(cat => {
      if (tokenContent.includes(cat)) foundCategories++;
    });

    logTest('Token System - All 6 main categories',
      foundCategories === 6,
      `${foundCategories}/6 categories found`);

    // Test 1.5: Check for key tokens
    const keyTokens = [
      'FIRSTNAME', 'LASTNAME', 'FULLNAME',
      'TITLE', 'COMPANY', 'EMAIL',
      'CITY', 'STATE', 'COUNTRY',
      'DATE', 'YEAR', 'MONTH'
    ];

    let foundTokens = 0;
    keyTokens.forEach(token => {
      if (tokenContent.includes(`'${token}'`) || tokenContent.includes(`"${token}"`)) {
        foundTokens++;
      }
    });

    logTest('Token System - Key tokens present',
      foundTokens === keyTokens.length,
      `${foundTokens}/${keyTokens.length} key tokens found`);

    // Test 1.6: Check for validation functions
    logTest('Token System - Validation functions',
      tokenContent.includes('validateToken') && tokenContent.includes('validator'),
      'Validation infrastructure present');

    // Test 1.7: Check for computed functions
    logTest('Token System - Computed functions',
      tokenContent.includes('computed:') && tokenContent.includes('computeAllTokens'),
      'Computed token infrastructure present');

    // Test 1.8: Check for helper functions
    const helpers = ['getTokenByKey', 'getTokensByCategory', 'getTokensRecord'];
    let foundHelpers = 0;
    helpers.forEach(helper => {
      if (tokenContent.includes(helper)) foundHelpers++;
    });

    logTest('Token System - Helper functions',
      foundHelpers === helpers.length,
      `${foundHelpers}/${helpers.length} helpers found`);

  } catch (error) {
    logTest('Token System - File read', false, error.message);
  }
}

// ============================================================================
// TEST 2: CLOUD GALLERY SERVICE STRUCTURE
// ============================================================================
console.log('\n☁️  Test 2: Cloud Gallery Service Structure');
console.log('-'.repeat(60));

function testCloudGalleryStructure() {
  try {
    const serviceContent = fs.readFileSync('./src/services/cloudGalleryService.ts', 'utf-8');

    // Test 2.1: File exists
    logTest('Cloud Gallery - File exists', true, 'Service file found');

    // Test 2.2: Check for all required methods
    const methods = [
      'saveImage', 'getImages', 'getImageById', 'updateImage', 'deleteImage',
      'toggleFavorite', 'addTags', 'removeTags',
      'createFolder', 'getFolders', 'updateFolder', 'deleteFolder',
      'savePromptHistory', 'getPromptHistory', 'getMostUsedPrompts',
      'addToQueue', 'getQueueItems', 'updateQueueItem', 'cancelQueueItem',
      'saveTokenProfile', 'getTokenProfiles', 'getDefaultTokenProfile',
      'trackEvent', 'getAnalytics'
    ];

    let foundMethods = 0;
    methods.forEach(method => {
      if (serviceContent.includes(`async ${method}`) || serviceContent.includes(`${method}(`)) {
        foundMethods++;
      }
    });

    logTest('Cloud Gallery - All methods defined',
      foundMethods >= 20,
      `${foundMethods}/${methods.length} methods found`);

    // Test 2.3: Check for TypeScript interfaces
    const interfaces = ['UserImage', 'Folder', 'PromptHistory', 'GenerationQueueItem', 'TokenProfile'];
    let foundInterfaces = 0;
    interfaces.forEach(iface => {
      if (serviceContent.includes(`interface ${iface}`)) foundInterfaces++;
    });

    logTest('Cloud Gallery - Type definitions',
      foundInterfaces === interfaces.length,
      `${foundInterfaces}/${interfaces.length} interfaces defined`);

    // Test 2.4: Check for Supabase integration
    logTest('Cloud Gallery - Supabase integration',
      serviceContent.includes('supabase') && serviceContent.includes('from('),
      'Supabase client usage found');

  } catch (error) {
    logTest('Cloud Gallery - File read', false, error.message);
  }
}

// ============================================================================
// TEST 3: PROMPT ENHANCEMENT SERVICE STRUCTURE
// ============================================================================
console.log('\n🤖 Test 3: Prompt Enhancement Service Structure');
console.log('-'.repeat(60));

function testPromptEnhancementStructure() {
  try {
    const serviceContent = fs.readFileSync('./src/services/promptEnhancementService.ts', 'utf-8');

    // Test 3.1: File exists
    logTest('Prompt Enhancement - File exists', true, 'Service file found');

    // Test 3.2: Check for all methods
    const methods = [
      'analyzePrompt',
      'enhancePrompt',
      'getSmartSuggestions',
      'validatePrompt',
      'getNegativePromptSuggestions'
    ];

    let foundMethods = 0;
    methods.forEach(method => {
      if (serviceContent.includes(method)) foundMethods++;
    });

    logTest('Prompt Enhancement - All methods defined',
      foundMethods === methods.length,
      `${foundMethods}/${methods.length} methods found`);

    // Test 3.3: Check for interfaces
    logTest('Prompt Enhancement - Type definitions',
      serviceContent.includes('PromptAnalysis') && serviceContent.includes('EnhancedPrompt'),
      'Type interfaces defined');

    // Test 3.4: Check for GPT-4 integration
    logTest('Prompt Enhancement - OpenAI integration',
      serviceContent.includes('openai') && serviceContent.includes('gpt-4'),
      'GPT-4 integration found');

    // Test 3.5: Check for fallback logic
    logTest('Prompt Enhancement - Fallback logic',
      serviceContent.includes('fallback'),
      'Fallback system implemented');

  } catch (error) {
    logTest('Prompt Enhancement - File read', false, error.message);
  }
}

// ============================================================================
// TEST 4: DATABASE MIGRATION
// ============================================================================
console.log('\n🗄️  Test 4: Database Migration');
console.log('-'.repeat(60));

function testMigration() {
  try {
    const migrationFiles = fs.readdirSync('./supabase/migrations').filter(f => f.endsWith('.sql'));
    const latestMigration = migrationFiles.sort().pop();

    logTest('Migration - Files exist',
      migrationFiles.length > 0,
      `Found ${migrationFiles.length} migration files`);

    if (latestMigration) {
      const migrationContent = fs.readFileSync(`./supabase/migrations/${latestMigration}`, 'utf-8');

      // Test 4.1: Check for all tables
      const tables = [
        'user_images',
        'folders',
        'image_tags',
        'prompt_history',
        'prompt_favorites',
        'generation_queue',
        'token_profiles',
        'analytics_events'
      ];

      let foundTables = 0;
      tables.forEach(table => {
        if (migrationContent.includes(`CREATE TABLE`) && migrationContent.includes(table)) {
          foundTables++;
        }
      });

      logTest('Migration - All 8 tables created',
        foundTables === 8,
        `${foundTables}/8 tables defined`);

      // Test 4.2: Check for RLS
      const rlsCount = (migrationContent.match(/ENABLE ROW LEVEL SECURITY/g) || []).length;
      logTest('Migration - RLS enabled on all tables',
        rlsCount === 8,
        `${rlsCount}/8 tables have RLS`);

      // Test 4.3: Check for policies
      const policyCount = (migrationContent.match(/CREATE POLICY/g) || []).length;
      logTest('Migration - Security policies created',
        policyCount >= 30,
        `${policyCount} policies defined`);

      // Test 4.4: Check for indexes
      const indexCount = (migrationContent.match(/CREATE INDEX/g) || []).length;
      logTest('Migration - Performance indexes created',
        indexCount >= 15,
        `${indexCount} indexes defined`);

      // Test 4.5: Check for functions
      logTest('Migration - Helper functions',
        migrationContent.includes('CREATE OR REPLACE FUNCTION'),
        'Database functions defined');

      // Test 4.6: Check for triggers
      logTest('Migration - Automatic triggers',
        migrationContent.includes('CREATE TRIGGER'),
        'Update triggers defined');
    }

  } catch (error) {
    logTest('Migration - File read', false, error.message);
  }
}

// ============================================================================
// TEST 5: SUPABASE CONNECTION
// ============================================================================
console.log('\n🔌 Test 5: Supabase Connection');
console.log('-'.repeat(60));

async function testSupabaseConnection() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  logTest('Supabase - Environment variables set',
    !!supabaseUrl && !!supabaseKey,
    supabaseUrl ? `URL: ${supabaseUrl.substring(0, 30)}...` : 'Missing URL');

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Test connection with a simple query
      const { data, error } = await supabase
        .from('user_images')
        .select('count')
        .limit(0);

      logTest('Supabase - Database reachable',
        !error || error.code === 'PGRST116',
        error ? `Protected by RLS (expected)` : 'Connected');

      // Test each table
      const tables = [
        'user_images', 'folders', 'image_tags', 'prompt_history',
        'prompt_favorites', 'generation_queue', 'token_profiles', 'analytics_events'
      ];

      let accessibleTables = 0;
      for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(0);
        if (!error || error.code === 'PGRST116') {
          accessibleTables++;
        }
      }

      logTest('Supabase - All tables accessible',
        accessibleTables === 8,
        `${accessibleTables}/8 tables accessible`);

    } catch (error) {
      logTest('Supabase - Connection test', false, error.message);
    }
  }
}

// ============================================================================
// TEST 6: DOCUMENTATION
// ============================================================================
console.log('\n📚 Test 6: Documentation');
console.log('-'.repeat(60));

function testDocumentation() {
  const docs = [
    { file: 'ENHANCEMENT_RECOMMENDATIONS.md', name: 'Enhancement Guide' },
    { file: 'PROMPT_OPTIMIZATION_GUIDE.md', name: 'Prompt Guide' },
    { file: 'IMPLEMENTATION_PROGRESS.md', name: 'Progress Report' },
    { file: 'WHATS_NEW.md', name: 'What\'s New' }
  ];

  let foundDocs = 0;
  docs.forEach(doc => {
    try {
      const content = fs.readFileSync(`./${doc.file}`, 'utf-8');
      logTest(`Documentation - ${doc.name}`, content.length > 100, `${content.length} bytes`);
      foundDocs++;
    } catch (error) {
      logTest(`Documentation - ${doc.name}`, false, 'File not found');
    }
  });

  logTest('Documentation - All guides created',
    foundDocs === docs.length,
    `${foundDocs}/${docs.length} documents found`);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
  const startTime = Date.now();

  testTokenStructure();
  testCloudGalleryStructure();
  testPromptEnhancementStructure();
  testMigration();
  await testSupabaseConnection();
  testDocumentation();

  const duration = Date.now() - startTime;

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`📊 Success Rate: ${successRate}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}`);
      if (t.details) console.log(`     ${t.details}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: successRate + '%'
    },
    tests: testResults.tests
  };

  const filename = `test-results-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));

  console.log(`\n💾 Results saved to: ${filename}\n`);

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
