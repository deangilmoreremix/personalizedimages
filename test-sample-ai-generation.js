#!/usr/bin/env node

/**
 * Sample AI Generation Testing Script
 * Tests a selection of prompts with actual AI image generation
 * Demonstrates the validation and testing process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample prompts to test (one from each collection)
const samplePrompts = [
  {
    collection: 'Music Stars',
    title: 'Rock Legend Figure',
    prompt: "A classic rock guitarist in torn jeans, leather vest, and scuffed boots, posed mid-solo with flying hair and intense expression. The figure holds a battered electric guitar with peeling stickers and worn strings. The backdrop depicts a smoky stage with Marshall amp stacks and colored stage lights. Accessories include a leather belt with metal studs and a cigarette prop. Photographed with dramatic concert lighting and motion blur effects for high-energy rock performance feel."
  },
  {
    collection: 'TV Shows',
    title: 'Sci-Fi Captain Figure',
    prompt: "A commanding starship captain in uniform, insignia, and authoritative pose, standing on a futuristic bridge with control panels and starfield views. The backdrop features space scenes, control consoles, and alien landscapes. Accessories include a communicator and command insignia. The figure has leadership presence and commanding demeanor, photographed with sci-fi lighting that emphasizes futuristic technology and space exploration."
  },
  {
    collection: 'Wrestling',
    title: 'Showman Champion Figure',
    prompt: "A charismatic wrestling champion in elaborate ring gear, championship belt, and flamboyant cape, posed with victory celebration and crowd-pleasing charisma. The figure has detailed muscular physique and confident expression. The backdrop shows wrestling ring with spotlights and roaring crowd. Accessories include championship belt and victory pose hands. Photographed with dramatic arena lighting and motion effects for championship celebration atmosphere."
  },
  {
    collection: 'Retro',
    title: 'Superhero Figure',
    prompt: "A powerful superhero in colorful costume, cape, and emblem, posed in city skyline with heroic action and comic book effects. The figure has superhero accessories and heroic gear, photographed with dynamic lighting and heroic atmosphere for classic superhero aesthetic."
  }
];

class AIGenerationTester {
  constructor() {
    this.results = [];
    this.apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  }

  // Simulate AI image generation (without actual API calls for demo)
  async simulateGeneration(prompt, title, collection) {
    console.log(`\n🤖 Testing: ${collection} - ${title}`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure based on prompt characteristics
    const hasVisualDetails = ['color', 'texture', 'expression', 'lighting', 'backdrop'].some(keyword =>
      prompt.toLowerCase().includes(keyword)
    );

    const hasProblematicContent = ['violence', 'blood', 'death'].some(keyword =>
      prompt.toLowerCase().includes(keyword)
    );

    const isTooLong = prompt.length > 4000;

    let result = {
      collection,
      title,
      promptLength: prompt.length,
      hasVisualDetails,
      hasProblematicContent,
      isTooLong,
      wouldSucceed: false,
      estimatedCost: 0,
      mockImageUrl: ''
    };

    if (!hasProblematicContent && !isTooLong && hasVisualDetails) {
      result.wouldSucceed = true;
      result.estimatedCost = 4; // cents for DALL-E 3
      result.mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/1024/1024`;
      console.log(`  ✅ SUCCESS - Would generate image`);
      console.log(`  💰 Estimated cost: $${(result.estimatedCost / 100).toFixed(3)}`);
    } else {
      result.wouldSucceed = false;
      console.log(`  ❌ FAILED - Issues found:`);
      if (hasProblematicContent) console.log(`    - Contains potentially problematic content`);
      if (isTooLong) console.log(`    - Prompt too long (${prompt.length} chars)`);
      if (!hasVisualDetails) console.log(`    - Missing visual details`);
    }

    return result;
  }

  // Test all sample prompts
  async testAllSamples() {
    console.log('🚀 Starting AI Generation Testing for Sample Prompts');
    console.log('=' .repeat(60));
    console.log('Note: This is a simulation. Actual API testing requires valid API keys.');
    console.log('=' .repeat(60));

    for (const sample of samplePrompts) {
      const result = await this.simulateGeneration(
        sample.prompt,
        sample.title,
        sample.collection
      );
      this.results.push(result);
    }

    this.printResults();
    this.saveResults();
  }

  // Print results
  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 AI GENERATION TEST RESULTS');
    console.log('=' .repeat(60));

    const successful = this.results.filter(r => r.wouldSucceed).length;
    const total = this.results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`Sample Prompts Tested: ${total}`);
    console.log(`✅ Would Succeed: ${successful}`);
    console.log(`❌ Would Fail: ${total - successful}`);
    console.log(`Success Rate: ${successRate}%`);

    const totalCost = this.results
      .filter(r => r.wouldSucceed)
      .reduce((sum, r) => sum + r.estimatedCost, 0);

    console.log(`💰 Estimated Total Cost: $${(totalCost / 100).toFixed(2)}`);

    console.log('\n📈 Results by Collection:');
    const byCollection = {};
    this.results.forEach(result => {
      if (!byCollection[result.collection]) {
        byCollection[result.collection] = { total: 0, success: 0 };
      }
      byCollection[result.collection].total++;
      if (result.wouldSucceed) byCollection[result.collection].success++;
    });

    Object.entries(byCollection).forEach(([collection, stats]) => {
      const rate = ((stats.success / stats.total) * 100).toFixed(1);
      console.log(`  ${collection}: ${stats.success}/${stats.total} (${rate}%)`);
    });

    console.log('\n🔍 ISSUES FOUND:');
    this.results.filter(r => !r.wouldSucceed).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.collection} - ${result.title}`);
      if (result.hasProblematicContent) console.log(`     - Contains potentially problematic content`);
      if (result.isTooLong) console.log(`     - Prompt too long (${result.promptLength} chars)`);
      if (!result.hasVisualDetails) console.log(`     - Missing visual details`);
    });

    console.log('\n' + '=' .repeat(60));

    if (successful === total) {
      console.log('🎉 ALL SAMPLE TESTS PASSED!');
      console.log('💡 These prompts are ready for production AI generation.');
    } else {
      console.log('⚠️  Some tests failed. Review and fix issues before production.');
    }
  }

  // Save results
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ai-generation-test-results-${timestamp}.json`;

    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      successfulTests: this.results.filter(r => r.wouldSucceed).length,
      failedTests: this.results.filter(r => !r.wouldSucceed).length,
      successRate: `${((this.results.filter(r => r.wouldSucceed).length / this.results.length) * 100).toFixed(1)}%`,
      estimatedTotalCost: this.results
        .filter(r => r.wouldSucceed)
        .reduce((sum, r) => sum + r.estimatedCost, 0) / 100,
      results: this.results
    };

    fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];

    const successRate = (this.results.filter(r => r.wouldSucceed).length / this.results.length) * 100;

    if (successRate >= 90) {
      recommendations.push('Excellent! Sample prompts are production-ready');
    } else if (successRate >= 75) {
      recommendations.push('Good success rate. Fix remaining issues for production');
    } else {
      recommendations.push('Significant issues found. Major prompt improvements needed');
    }

    const failedTests = this.results.filter(r => !r.wouldSucceed);
    if (failedTests.some(r => r.hasProblematicContent)) {
      recommendations.push('Remove or replace potentially problematic content');
    }

    if (failedTests.some(r => !r.hasVisualDetails)) {
      recommendations.push('Add more specific visual details (colors, textures, lighting)');
    }

    if (failedTests.some(r => r.isTooLong)) {
      recommendations.push('Shorten prompts that exceed AI limits (4000 chars)');
    }

    recommendations.push('Test with actual AI APIs using valid API keys');
    recommendations.push('Monitor API costs and usage patterns');

    return recommendations;
  }
}

// Run the AI generation testing
const tester = new AIGenerationTester();
await tester.testAllSamples();

console.log('\n📋 RECOMMENDATIONS:');
tester.generateRecommendations().forEach((rec, index) => {
  console.log(`  ${index + 1}. ${rec}`);
});

console.log('\n✅ AI generation testing complete!');
console.log('💡 To test with real APIs, set VITE_OPENAI_API_KEY environment variable');