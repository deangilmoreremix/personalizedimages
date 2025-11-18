// Test API keys using centralized environment loader
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    console.warn('Could not read .env file, using process.env only');
    return process.env;
  }
}

// Merge environment sources with priority: .env file > process.env
function loadEnvironment() {
  const fileEnv = loadEnvFile();
  const processEnv = process.env;

  return { ...processEnv, ...fileEnv };
}

// Get API key for a specific provider with validation
function getApiKey(provider) {
  const config = loadEnvironment();

  switch (provider) {
    case 'openai':
      return config.VITE_OPENAI_API_KEY || null;
    case 'gemini':
      return config.VITE_GEMINI_API_KEY || null;
    case 'gemini-nano':
      return config.VITE_GEMINI_NANO_API_KEY || null;
    case 'leonardo':
      return config.VITE_LEONARDO_API_KEY || null;
    case 'giphy':
      return config.VITE_GIPHY_API_KEY || null;
    default:
      return null;
  }
}

// Check if a specific API key is available and valid
function hasValidApiKey(provider) {
  const config = loadEnvironment();

  switch (provider) {
    case 'openai':
      return !!(config.VITE_OPENAI_API_KEY && config.VITE_OPENAI_API_KEY.startsWith('sk-'));
    case 'gemini':
    case 'gemini-nano':
      const key = provider === 'gemini' ? config.VITE_GEMINI_API_KEY : config.VITE_GEMINI_NANO_API_KEY;
      return !!(key && key.startsWith('AIza'));
    case 'leonardo':
      return !!config.VITE_LEONARDO_API_KEY;
    case 'giphy':
      return !!config.VITE_GIPHY_API_KEY;
    default:
      return false;
  }
}

const OPENAI_KEY = getApiKey('openai') || '';
const GEMINI_KEY = getApiKey('gemini') || '';

console.log('Testing API Keys...\n');

// Test OpenAI
async function testOpenAI() {
  console.log('1. OpenAI API Key:');
  console.log(`   Length: ${OPENAI_KEY.length} characters`);
  console.log(`   Format: ${OPENAI_KEY.substring(0, 15)}...`);

  if (OPENAI_KEY.length < 20) {
    console.log('   ❌ Key too short or missing\n');
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
    });

    if (response.ok) {
      console.log('   ✅ OpenAI API Key is VALID\n');
    } else {
      const errorText = await response.text();
      console.log(`   ❌ OpenAI API returned: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 200)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

// Test Gemini
async function testGemini() {
  console.log('2. Gemini API Key:');
  console.log(`   Length: ${GEMINI_KEY.length} characters`);
  console.log(`   Format: ${GEMINI_KEY.substring(0, 15)}...`);

  if (GEMINI_KEY.length < 20) {
    console.log('   ❌ Key too short or missing\n');
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Gemini API Key is VALID`);
      console.log(`   Available models: ${data.models?.length || 0}\n`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Gemini API returned: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 200)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function main() {
  await testOpenAI();
  await testGemini();
  console.log('Testing complete!');
}

main();
