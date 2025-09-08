#!/usr/bin/env node

/**
 * Schema Integration Test Script
 * Tests the comprehensive database schema and service integration
 */

import { supabase } from './src/utils/supabaseClient.js';
import { userProfileService, tokenService, imageService, projectService, referenceImageService, apiUsageService, dbUtils } from './src/services/supabaseService.js';

class SchemaIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, status = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[status]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running: ${testName}`, 'info');
      const result = await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'passed', result });
      this.log(`✅ ${testName} - PASSED`, 'success');
      return result;
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'failed', error: error.message });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
      return null;
    }
  }

  async testDatabaseConnection() {
    return this.runTest('Database Connection', async () => {
      const isHealthy = await dbUtils.healthCheck();
      if (!isHealthy) {
        throw new Error('Database connection failed');
      }
      return { healthy: true };
    });
  }

  async testTableCounts() {
    return this.runTest('Table Structure', async () => {
      const counts = await dbUtils.getTableCounts();
      const expectedTables = [
        'user_profiles',
        'personalization_tokens',
        'generated_images',
        'user_projects',
        'reference_images',
        'user_fonts',
        'generated_videos',
        'api_usage',
        'user_preferences'
      ];

      const missingTables = expectedTables.filter(table => !(table in counts));
      if (missingTables.length > 0) {
        throw new Error(`Missing tables: ${missingTables.join(', ')}`);
      }

      return { tableCounts: counts };
    });
  }

  async testUserProfileOperations() {
    return this.runTest('User Profile Operations', async () => {
      // Test creating a profile (this will fail in production due to auth, but tests the schema)
      const testProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User'
      };

      try {
        // This might fail due to RLS, but that's expected
        await userProfileService.createProfile(testProfile);
      } catch (error) {
        // Expected due to RLS - just verify the table exists
        if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
          return { rlsWorking: true, error: error.message };
        }
        throw error;
      }

      return { profileOperations: 'available' };
    });
  }

  async testTokenOperations() {
    return this.runTest('Personalization Token Operations', async () => {
      // Test token operations (will fail due to auth, but tests schema)
      try {
        const tokens = await tokenService.getUserTokens('test-user-id');
        return { tokenOperations: 'available', tokenCount: tokens.length };
      } catch (error) {
        if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
          return { rlsWorking: true, error: error.message };
        }
        throw error;
      }
    });
  }

  async testImageOperations() {
    return this.runTest('Generated Image Operations', async () => {
      // Test image operations
      try {
        const images = await imageService.getUserImages('test-user-id');
        return { imageOperations: 'available', imageCount: images.length };
      } catch (error) {
        if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
          return { rlsWorking: true, error: error.message };
        }
        throw error;
      }
    });
  }

  async testProjectOperations() {
    return this.runTest('Project Operations', async () => {
      // Test project operations
      try {
        const projects = await projectService.getUserProjects('test-user-id');
        return { projectOperations: 'available', projectCount: projects.length };
      } catch (error) {
        if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
          return { rlsWorking: true, error: error.message };
        }
        throw error;
      }
    });
  }

  async testApiUsageOperations() {
    return this.runTest('API Usage Operations', async () => {
      // Test API usage operations
      try {
        const usage = await apiUsageService.getUserUsage('test-user-id');
        return { apiUsageOperations: 'available', usageCount: usage.length };
      } catch (error) {
        if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
          return { rlsWorking: true, error: error.message };
        }
        throw error;
      }
    });
  }

  async testRLSPolicies() {
    return this.runTest('Row Level Security Policies', async () => {
      // Test that RLS is enabled on all tables
      const tables = [
        'user_profiles',
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

      const rlsStatus = {};

      for (const table of tables) {
        try {
          // Try to query without auth (should fail due to RLS)
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (error && (error.message.includes('permission denied') || error.message.includes('violates row-level security'))) {
            rlsStatus[table] = 'enabled';
          } else {
            rlsStatus[table] = 'disabled or misconfigured';
          }
        } catch (error) {
          rlsStatus[table] = 'error checking RLS';
        }
      }

      const disabledTables = Object.entries(rlsStatus)
        .filter(([_, status]) => status !== 'enabled')
        .map(([table, _]) => table);

      if (disabledTables.length > 0) {
        throw new Error(`RLS not properly configured for: ${disabledTables.join(', ')}`);
      }

      return { rlsStatus };
    });
  }

  async generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('SCHEMA INTEGRATION TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');

    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, 'error');

    if (this.results.failed > 0) {
      this.log('\nFailed Tests:', 'error');
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          this.log(`  ❌ ${test.name}: ${test.error}`, 'error');
        });
    }

    this.log('\nDetailed Results:', 'info');
    this.results.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      this.log(`  ${status} ${test.name}`, test.status === 'passed' ? 'success' : 'error');
      if (test.result) {
        this.log(`    Result: ${JSON.stringify(test.result, null, 2)}`, 'info');
      }
    });

    const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    this.log(`\nSuccess Rate: ${successRate}%`, this.results.failed === 0 ? 'success' : 'warning');

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! Schema integration is successful.', 'success');
    } else {
      this.log('\n⚠️  Some tests failed. Please check the errors above.', 'warning');
    }
  }

  async runAllTests() {
    this.log('Starting Schema Integration Tests...', 'info');
    this.log('This will test the comprehensive database schema and service integration', 'info');

    try {
      await this.testDatabaseConnection();
      await this.testTableCounts();
      await this.testRLSPolicies();
      await this.testUserProfileOperations();
      await this.testTokenOperations();
      await this.testImageOperations();
      await this.testProjectOperations();
      await this.testApiUsageOperations();

      await this.generateReport();
    } catch (error) {
      this.log(`Critical error during testing: ${error.message}`, 'error');
    }
  }
}

// Run the tests
const tester = new SchemaIntegrationTester();
tester.runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});