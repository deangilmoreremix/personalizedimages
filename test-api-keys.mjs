// Test API keys
const OPENAI_KEY = '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';
const GEMINI_KEY = 'AIzaSyCUcTq2wJAGuUvh06qy_QfA8YfCuaS93bM';

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
