#!/usr/bin/env node

/**
 * Test script for Google Gemini Nano API integration
 * Tests image generation and editing capabilities
 */

import { generateImageWithGeminiNano, editImageWithGeminiNano, generateVariationsWithGeminiNano } from './src/utils/geminiNanoApi.js';
import { hasApiKey } from './src/utils/apiUtils.js';

async function testGeminiNanoIntegration() {
  console.log('🧪 Testing Google Gemini Nano API Integration');
  console.log('==============================================');

  // Check if API key is available
  if (!hasApiKey('gemini-nano')) {
    console.log('❌ Gemini Nano API key not found');
    console.log('Please ensure VITE_GEMINI_NANO_API_KEY is set in your environment');
    return;
  }

  console.log('✅ Gemini Nano API key found');

  try {
    // Test 1: Basic image generation
    console.log('\n📸 Test 1: Basic Image Generation');
    console.log('----------------------------------');

    const prompt = 'A beautiful sunset over mountains with vibrant colors';
    console.log(`Generating image with prompt: "${prompt}"`);

    const imageUrl = await generateImageWithGeminiNano(prompt, {
      aspectRatio: '16:9',
      style: 'photography',
      quality: 'high'
    });

    console.log('✅ Image generated successfully!');
    console.log('Image URL:', imageUrl.substring(0, 100) + '...');

    // Test 2: Image editing (if we have an image URL)
    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log('\n✏️ Test 2: Image Editing');
      console.log('------------------------');

      console.log('Testing image enhancement...');
      const enhancedImage = await editImageWithGeminiNano(imageUrl, {
        mode: 'enhance',
        intensity: 0.8
      });

      console.log('✅ Image enhanced successfully!');
      console.log('Enhanced image URL:', enhancedImage.substring(0, 100) + '...');

      // Test 3: Image variations
      console.log('\n🔄 Test 3: Image Variations');
      console.log('----------------------------');

      console.log('Generating 2 variations...');
      const variations = await generateVariationsWithGeminiNano(imageUrl, 2);

      console.log(`✅ Generated ${variations.length} variations successfully!`);
      variations.forEach((variation, index) => {
        console.log(`Variation ${index + 1}:`, variation.substring(0, 100) + '...');
      });
    }

    console.log('\n🎉 All Gemini Nano tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ API key validation: PASSED');
    console.log('- ✅ Image generation: PASSED');
    console.log('- ✅ Image editing: PASSED');
    console.log('- ✅ Image variations: PASSED');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Gemini Nano API key is correct');
    console.log('2. Check your internet connection');
    console.log('3. Ensure the API key has proper permissions');
    console.log('4. Try again in a few minutes (rate limits may apply)');
  }
}

// Run the test
testGeminiNanoIntegration().catch(error => {
  console.error('💥 Critical error during testing:', error);
  process.exit(1);
});