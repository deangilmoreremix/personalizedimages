#!/usr/bin/env node

/**
 * Action Figure Prompts Testing Script
 * Tests all 90 action figure prompts to ensure they work with AI image generation
 */

const fs = require('fs');
const path = require('path');

// Import the prompt collections
const musicPrompts = require('./src/data/musicStarActionFigures.ts');
const tvPrompts = require('./src/data/tvShowActionFigures.ts');
const wrestlingPrompts = require('./src/data/wrestlingActionFigures.ts');
const retroPrompts = require('./src/data/retroActionFigures.ts');

class PromptTester {
  constructor() {
    this.collections = {
      music: musicPrompts.default || musicPrompts,
      tv: tvPrompts.default || tvPrompts,
      wrestling: wrestlingPrompts.default || wrestlingPrompts,
      retro: retroPrompts.default || retroPrompts
    };

    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // Validate prompt structure
  validatePromptStructure(prompt, category, index) {
    const requiredFields = ['title', 'basePrompt', 'additions', 'removals', 'poses', 'packaging'];

    for (const field of requiredFields) {
      if (!prompt[field]) {
        this.results.errors.push({
          category,
          index,
          title: prompt.title,
          error: `Missing required field: ${field}`
        });
        return false;
      }
    }

    // Validate arrays
    if (!Array.isArray(prompt.additions) || prompt.additions.length !== 2) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: 'Additions must be an array of exactly 2 items'
      });
      return false;
    }

    if (!Array.isArray(prompt.removals) || prompt.removals.length !== 2) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: 'Removals must be an array of exactly 2 items'
      });
      return false;
    }

    if (!Array.isArray(prompt.poses) || prompt.poses.length !== 3) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: 'Poses must be an array of exactly 3 items'
      });
      return false;
    }

    return true;
  }

  // Validate prompt content quality
  validatePromptContent(prompt, category, index) {
    const issues = [];

    // Check prompt length (should be substantial for good AI generation)
    if (prompt.basePrompt.length < 100) {
      issues.push('Base prompt too short (< 100 characters)');
    }

    // Check for toy photography styling keywords
    const toyKeywords = ['photographed', 'lighting', 'backdrop', 'accessories', 'figure', 'pose'];
    const hasToyStyling = toyKeywords.some(keyword =>
      prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasToyStyling) {
      issues.push('Missing toy photography styling keywords');
    }

    // Check for specific visual details
    const visualKeywords = ['color', 'texture', 'expression', 'stance', 'features'];
    const hasVisualDetails = visualKeywords.some(keyword =>
      prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasVisualDetails) {
      issues.push('Missing specific visual details');
    }

    if (issues.length > 0) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: `Content quality issues: ${issues.join(', ')}`
      });
      return false;
    }

    return true;
  }

  // Test prompt compatibility with AI generation
  async testPromptCompatibility(prompt, category, index) {
    // Simulate AI prompt validation (without actual API calls)
    const testPrompt = `${prompt.basePrompt} Create this as a detailed action figure photograph.`;

    // Check for potentially problematic content
    const problematicTerms = ['violence', 'weapon', 'blood', 'death', 'harm'];
    const hasProblematicContent = problematicTerms.some(term =>
      testPrompt.toLowerCase().includes(term)
    );

    if (hasProblematicContent) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: 'May contain content that could be flagged by AI safety filters'
      });
      return false;
    }

    // Check prompt length for AI limits
    if (testPrompt.length > 4000) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title,
        error: 'Prompt too long for AI generation (> 4000 characters)'
      });
      return false;
    }

    return true;
  }

  async testCollection(collectionName) {
    const collection = this.collections[collectionName];
    console.log(`\n🧪 Testing ${collectionName} collection (${collection.length} prompts)...`);

    for (let i = 0; i < collection.length; i++) {
      const prompt = collection[i];
      this.results.total++;

      console.log(`  Testing: ${prompt.title}`);

      // Test structure
      const structureValid = this.validatePromptStructure(prompt, collectionName, i);

      // Test content quality
      const contentValid = this.validatePromptContent(prompt, collectionName, i);

      // Test AI compatibility
      const compatibilityValid = await this.testPromptCompatibility(prompt, collectionName, i);

      if (structureValid && contentValid && compatibilityValid) {
        this.results.passed++;
        console.log(`    ✅ PASSED`);
      } else {
        this.results.failed++;
        console.log(`    ❌ FAILED`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Action Figure Prompts Testing Suite');
    console.log('=' .repeat(50));

    const collections = Object.keys(this.collections);

    for (const collectionName of collections) {
      await this.testCollection(collectionName);
    }

    this.printResults();
  }

  printResults() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(50));

    console.log(`Total Prompts Tested: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🔍 ERRORS FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.category.toUpperCase()}] ${error.title}`);
        console.log(`   ${error.error}`);
      });
    }

    console.log('\n' + '=' .repeat(50));

    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Prompts are ready for AI image generation.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues above.');
    }
  }

  // Export results for further analysis
  exportResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `prompt-test-results-${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results exported to: ${filename}`);
  }
}

// Run the tests
async function main() {
  const tester = new PromptTester();
  await tester.runAllTests();
  tester.exportResults();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PromptTester;