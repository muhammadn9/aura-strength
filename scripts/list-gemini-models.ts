/**
 * Test Google Gemini API directly (without Vercel AI SDK)
 *
 * Call the Google API directly to see what models are available
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

console.log('🧪 Testing Google Gemini API DIRECTLY...\n');
console.log('API Key Status:', apiKey ? `✅ SET (${apiKey.length} chars)` : '❌ NOT SET');

if (!apiKey) {
  console.error('❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not set');
  process.exit(1);
}

async function listModels() {
  try {
    console.log('\n📋 Fetching available models from Google...\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch models:', response.status, response.statusText);
      console.error('Response:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ Available models:');
    console.log('='.repeat(60));

    if (data.models && data.models.length > 0) {
      data.models.forEach((model: any) => {
        console.log(`\n📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      });

      console.log('\n' + '='.repeat(60));
      console.log(`\n✨ Total models: ${data.models.length}`);

      // Find models that support generateContent
      const contentModels = data.models.filter((m: any) =>
        m.supportedGenerationMethods?.includes('generateContent')
      );

      console.log(`\n💡 Models that support generateContent:`);
      contentModels.forEach((m: any) => {
        const modelId = m.name.replace('models/', '');
        console.log(`   ✅ ${modelId}`);
      });

    } else {
      console.log('⚠️  No models found!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

listModels();

