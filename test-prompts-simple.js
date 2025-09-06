#!/usr/bin/env node

/**
 * Simple Action Figure Prompts Testing Script
 * Tests prompt structure and content quality without complex imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PromptValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // Read and parse TypeScript files to extract prompt data
  extractPromptsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract the array content between the brackets
      const arrayMatch = content.match(/const \w+ActionFigurePrompts: \w+\[\] = \[([\s\S]*?)\];/);
      if (!arrayMatch) {
        console.log(`No prompts array found in ${filePath}`);
        return [];
      }

      const arrayContent = arrayMatch[1];

      // Split by object boundaries and parse
      const objects = [];
      let braceCount = 0;
      let currentObject = '';
      let inObject = false;

      for (let i = 0; i < arrayContent.length; i++) {
        const char = arrayContent[i];

        if (char === '{') {
          braceCount++;
          if (!inObject) {
            inObject = true;
            currentObject = '';
          }
        }

        if (inObject) {
          currentObject += char;
        }

        if (char === '}') {
          braceCount--;
          if (braceCount === 0 && inObject) {
            // Try to parse the object
            try {
              // Clean up the object string for JSON parsing
              let cleanObject = currentObject
                .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
                .replace(/'/g, '"')           // Convert single quotes to double
                .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

              const parsed = JSON.parse(cleanObject);
              objects.push(parsed);
            } catch (e) {
              console.log(`Failed to parse object: ${e.message}`);
            }
            inObject = false;
            currentObject = '';
          }
        }
      }

      return objects;
    } catch (error) {
      console.log(`Error reading ${filePath}: ${error.message}`);
      return [];
    }
  }

  validatePromptStructure(prompt, category, index) {
    const requiredFields = ['title', 'basePrompt', 'additions', 'removals', 'poses', 'packaging'];

    for (const field of requiredFields) {
      if (!prompt[field]) {
        this.results.errors.push({
          category,
          index,
          title: prompt.title || 'Unknown',
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
        title: prompt.title || 'Unknown',
        error: 'Additions must be an array of exactly 2 items'
      });
      return false;
    }

    if (!Array.isArray(prompt.removals) || prompt.removals.length !== 2) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title || 'Unknown',
        error: 'Removals must be an array of exactly 2 items'
      });
      return false;
    }

    if (!Array.isArray(prompt.poses) || prompt.poses.length !== 3) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title || 'Unknown',
        error: 'Poses must be an array of exactly 3 items'
      });
      return false;
    }

    return true;
  }

  validatePromptContent(prompt, category, index) {
    const issues = [];

    // Check prompt length
    if (!prompt.basePrompt || prompt.basePrompt.length < 100) {
      issues.push('Base prompt too short (< 100 characters)');
    }

    // Check for toy photography styling keywords
    const toyKeywords = ['photographed', 'lighting', 'backdrop', 'accessories', 'figure', 'pose'];
    const hasToyStyling = toyKeywords.some(keyword =>
      prompt.basePrompt && prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasToyStyling) {
      issues.push('Missing toy photography styling keywords');
    }

    // Check for specific visual details
    const visualKeywords = ['color', 'texture', 'expression', 'stance', 'features'];
    const hasVisualDetails = visualKeywords.some(keyword =>
      prompt.basePrompt && prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasVisualDetails) {
      issues.push('Missing specific visual details');
    }

    if (issues.length > 0) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title || 'Unknown',
        error: `Content quality issues: ${issues.join(', ')}`
      });
      return false;
    }

    return true;
  }

  testPromptCompatibility(prompt, category, index) {
    if (!prompt.basePrompt) return false;

    const testPrompt = `${prompt.basePrompt} Create this as a detailed action figure photograph.`;

    // Check for potentially problematic content
    const problematicTerms = ['violence', 'blood', 'death', 'harm'];
    const hasProblematicContent = problematicTerms.some(term =>
      testPrompt.toLowerCase().includes(term)
    );

    if (hasProblematicContent) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title || 'Unknown',
        error: 'May contain content that could be flagged by AI safety filters'
      });
      return false;
    }

    // Check prompt length for AI limits
    if (testPrompt.length > 4000) {
      this.results.errors.push({
        category,
        index,
        title: prompt.title || 'Unknown',
        error: 'Prompt too long for AI generation (> 4000 characters)'
      });
      return false;
    }

    return true;
  }

  testCollection(filePath, collectionName) {
    console.log(`\n🧪 Testing ${collectionName} collection...`);

    const prompts = this.extractPromptsFromFile(filePath);
    console.log(`Found ${prompts.length} prompts in ${collectionName}`);

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      this.results.total++;

      console.log(`  Testing: ${prompt.title || 'Unknown'}`);

      // Test structure
      const structureValid = this.validatePromptStructure(prompt, collectionName, i);

      // Test content quality
      const contentValid = this.validatePromptContent(prompt, collectionName, i);

      // Test AI compatibility
      const compatibilityValid = this.testPromptCompatibility(prompt, collectionName, i);

      if (structureValid && contentValid && compatibilityValid) {
        this.results.passed++;
        console.log(`    ✅ PASSED`);
      } else {
        this.results.failed++;
        console.log(`    ❌ FAILED`);
      }
    }

    return prompts.length;
  }

  runAllTests() {
    console.log('🚀 Starting Action Figure Prompts Validation Suite');
    console.log('=' .repeat(60));

    const collections = [
      { file: 'src/data/musicStarActionFigures.ts', name: 'Music Stars' },
      { file: 'src/data/tvShowActionFigures.ts', name: 'TV Shows' },
      { file: 'src/data/wrestlingActionFigures.ts', name: 'Wrestling' },
      { file: 'src/data/retroActionFigures.ts', name: 'Retro' }
    ];

    let totalPrompts = 0;

    for (const collection of collections) {
      const count = this.testCollection(collection.file, collection.name);
      totalPrompts += count;
    }

    this.printResults();
    return totalPrompts;
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VALIDATION RESULTS SUMMARY');
    console.log('=' .repeat(60));

    console.log(`Total Prompts Tested: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🔍 ERRORS FOUND:');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. [${error.category.toUpperCase()}] ${error.title}`);
        console.log(`   ${error.error}`);
      });

      if (this.results.errors.length > 10) {
        console.log(`   ... and ${this.results.errors.length - 10} more errors`);
      }
    }

    console.log('\n' + '=' .repeat(60));

    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Prompts are ready for AI image generation.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues above.');
    }
  }
}

// Run the validation
const validator = new PromptValidator();
const totalPrompts = validator.runAllTests();

console.log(`\n📈 Total prompts validated: ${totalPrompts}`);
console.log('💡 Note: This validation checks structure, content quality, and AI compatibility.');
console.log('🔄 For actual AI image generation testing, use the app interface with API keys configured.');