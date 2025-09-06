#!/usr/bin/env node

/**
 * Comprehensive Action Figure Prompts Validation Suite
 * Automated testing script for ongoing validation of all 122 prompts
 * Can be run as part of CI/CD pipeline or manual testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensivePromptValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      collections: {},
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };

    this.collections = [
      { file: 'src/data/musicStarActionFigures.ts', name: 'Music Stars', expected: 30 },
      { file: 'src/data/tvShowActionFigures.ts', name: 'TV Shows', expected: 30 },
      { file: 'src/data/wrestlingActionFigures.ts', name: 'Wrestling', expected: 31 },
      { file: 'src/data/retroActionFigures.ts', name: 'Retro', expected: 31 }
    ];
  }

  // Extract prompts from TypeScript files
  extractPromptsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract the array content between the brackets
      const arrayMatch = content.match(/const \w+ActionFigurePrompts: \w+\[\] = \[([\s\S]*?)\];/);
      if (!arrayMatch) {
        this.results.errors.push(`No prompts array found in ${filePath}`);
        return [];
      }

      const arrayContent = arrayMatch[1];
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
            try {
              let cleanObject = currentObject
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, '$1');

              const parsed = JSON.parse(cleanObject);
              objects.push(parsed);
            } catch (e) {
              this.results.errors.push(`Failed to parse object in ${filePath}: ${e.message}`);
            }
            inObject = false;
            currentObject = '';
          }
        }
      }

      return objects;
    } catch (error) {
      this.results.errors.push(`Error reading ${filePath}: ${error.message}`);
      return [];
    }
  }

  // Validate prompt structure
  validateStructure(prompt, collectionName, index) {
    const requiredFields = ['title', 'basePrompt', 'additions', 'removals', 'poses', 'packaging'];

    for (const field of requiredFields) {
      if (!prompt[field]) {
        this.results.errors.push(`${collectionName}[${index}]: Missing required field '${field}'`);
        return false;
      }
    }

    // Validate arrays
    if (!Array.isArray(prompt.additions) || prompt.additions.length !== 2) {
      this.results.errors.push(`${collectionName}[${index}]: Additions must be array of exactly 2 items`);
      return false;
    }

    if (!Array.isArray(prompt.removals) || prompt.removals.length !== 2) {
      this.results.errors.push(`${collectionName}[${index}]: Removals must be array of exactly 2 items`);
      return false;
    }

    if (!Array.isArray(prompt.poses) || prompt.poses.length !== 3) {
      this.results.errors.push(`${collectionName}[${index}]: Poses must be array of exactly 3 items`);
      return false;
    }

    return true;
  }

  // Validate prompt content quality
  validateContent(prompt, collectionName, index) {
    let isValid = true;

    // Check prompt length
    if (!prompt.basePrompt || prompt.basePrompt.length < 100) {
      this.results.errors.push(`${collectionName}[${index}]: Base prompt too short (< 100 chars)`);
      isValid = false;
    }

    // Check for toy photography styling keywords
    const toyKeywords = ['photographed', 'lighting', 'backdrop', 'accessories', 'figure', 'pose'];
    const hasToyStyling = toyKeywords.some(keyword =>
      prompt.basePrompt && prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasToyStyling) {
      this.results.warnings.push(`${collectionName}[${index}]: Missing toy photography styling keywords`);
    }

    // Check for specific visual details
    const visualKeywords = ['color', 'texture', 'expression', 'stance', 'features'];
    const hasVisualDetails = visualKeywords.some(keyword =>
      prompt.basePrompt && prompt.basePrompt.toLowerCase().includes(keyword)
    );

    if (!hasVisualDetails) {
      this.results.errors.push(`${collectionName}[${index}]: Missing specific visual details`);
      isValid = false;
    }

    return isValid;
  }

  // Validate AI compatibility
  validateAICompatibility(prompt, collectionName, index) {
    if (!prompt.basePrompt) return false;

    const testPrompt = `${prompt.basePrompt} Create this as a detailed action figure photograph.`;

    // Check for potentially problematic content
    const problematicTerms = ['violence', 'blood', 'death', 'harm'];
    const hasProblematicContent = problematicTerms.some(term =>
      testPrompt.toLowerCase().includes(term)
    );

    if (hasProblematicContent) {
      this.results.errors.push(`${collectionName}[${index}]: May trigger AI safety filters`);
      return false;
    }

    // Check prompt length for AI limits
    if (testPrompt.length > 4000) {
      this.results.errors.push(`${collectionName}[${index}]: Prompt too long for AI generation`);
      return false;
    }

    return true;
  }

  // Validate uniqueness
  validateUniqueness(prompts, collectionName) {
    const titles = prompts.map(p => p.title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);

    if (duplicates.length > 0) {
      this.results.errors.push(`${collectionName}: Duplicate titles found: ${duplicates.join(', ')}`);
      return false;
    }

    return true;
  }

  // Test collection
  async testCollection(collection) {
    console.log(`\n🧪 Testing ${collection.name} collection...`);

    const prompts = this.extractPromptsFromFile(collection.file);
    console.log(`Found ${prompts.length} prompts (expected: ${collection.expected})`);

    if (prompts.length !== collection.expected) {
      this.results.errors.push(`${collection.name}: Expected ${collection.expected} prompts, found ${prompts.length}`);
    }

    this.results.collections[collection.name] = {
      total: prompts.length,
      passed: 0,
      failed: 0,
      errors: []
    };

    // Validate uniqueness
    this.validateUniqueness(prompts, collection.name);

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      this.results.total++;

      const structureValid = this.validateStructure(prompt, collection.name, i);
      const contentValid = this.validateContent(prompt, collection.name, i);
      const aiValid = this.validateAICompatibility(prompt, collection.name, i);

      if (structureValid && contentValid && aiValid) {
        this.results.passed++;
        this.results.collections[collection.name].passed++;
      } else {
        this.results.failed++;
        this.results.collections[collection.name].failed++;
      }
    }

    console.log(`  ✅ Passed: ${this.results.collections[collection.name].passed}`);
    console.log(`  ❌ Failed: ${this.results.collections[collection.name].failed}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Action Figure Prompts Validation');
    console.log('='.repeat(70));

    for (const collection of this.collections) {
      await this.testCollection(collection);
    }

    this.printResults();
    this.saveResults();
  }

  // Print results
  printResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 VALIDATION RESULTS SUMMARY');
    console.log('='.repeat(70));

    console.log(`Total Prompts Tested: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    console.log('\n📈 Collection Breakdown:');
    Object.entries(this.results.collections).forEach(([name, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${name}: ${stats.passed}/${stats.total} (${rate}%)`);
    });

    if (this.results.errors.length > 0) {
      console.log('\n🔍 ERRORS FOUND:');
      this.results.errors.slice(0, 15).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });

      if (this.results.errors.length > 15) {
        console.log(`  ... and ${this.results.errors.length - 15} more errors`);
      }
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    console.log('\n' + '='.repeat(70));

    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Prompts are ready for AI image generation.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues above.');
    }
  }

  // Save results to file
  saveResults() {
    const filename = `validation-results-${this.results.timestamp.replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);

    // Also save a summary
    const summary = {
      timestamp: this.results.timestamp,
      total: this.results.total,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: `${((this.results.passed / this.results.total) * 100).toFixed(1)}%`,
      collections: Object.entries(this.results.collections).map(([name, stats]) => ({
        name,
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
        successRate: `${((stats.passed / stats.total) * 100).toFixed(1)}%`
      }))
    };

    const summaryFilename = `validation-summary-${this.results.timestamp.replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(summaryFilename, JSON.stringify(summary, null, 2));
    console.log(`💾 Summary saved to: ${summaryFilename}`);
  }

  // Generate test report
  generateReport() {
    const report = {
      title: 'Action Figure Prompts Validation Report',
      timestamp: this.results.timestamp,
      summary: {
        totalPrompts: this.results.total,
        passedPrompts: this.results.passed,
        failedPrompts: this.results.failed,
        successRate: `${((this.results.passed / this.results.total) * 100).toFixed(1)}%`
      },
      collections: this.results.collections,
      errors: this.results.errors,
      warnings: this.results.warnings,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // Generate recommendations based on results
  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push('Fix validation errors before deploying to production');
    }

    if (this.results.warnings.length > 0) {
      recommendations.push('Address warnings to improve prompt quality');
    }

    if (this.results.passed / this.results.total < 0.9) {
      recommendations.push('Improve prompt quality to achieve >90% success rate');
    }

    recommendations.push('Run this validation script regularly as part of CI/CD pipeline');
    recommendations.push('Test prompts with actual AI APIs before production deployment');

    return recommendations;
  }
}

// Run the comprehensive validation
const validator = new ComprehensivePromptValidator();
await validator.runAllTests();

// Generate and display report
const report = validator.generateReport();
console.log('\n📋 RECOMMENDATIONS:');
report.recommendations.forEach((rec, index) => {
  console.log(`  ${index + 1}. ${rec}`);
});

console.log('\n✅ Validation complete! Check the generated JSON files for detailed results.');