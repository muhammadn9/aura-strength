/**
 * Test Google Gemini API
 *
 * Standalone test to verify the API key works
 */

// Load environment from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Load environment
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

console.log('🧪 Testing Google Gemini API...\n');
console.log('API Key Status:', apiKey ? `✅ SET (${apiKey.length} chars)` : '❌ NOT SET');

if (!apiKey) {
  console.error('❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not set in environment');
  process.exit(1);
}

// Simple test schema
const TestSchema = z.object({
  message: z.string(),
  exercises: z.array(z.string()).min(3).max(5),
});

async function testGeminiAPI() {
  // Try current model names (based on API response)
  const modelsToTry = [
    'gemini-2.5-flash',     // Current stable (June 2025)
    'gemini-2.0-flash',     // Alternative
    'gemini-flash-latest',  // Always latest
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n📡 Trying model: ${modelName}...`);

      const result = await generateObject({
        model: google(modelName),
        system: 'You are a helpful fitness coach.',
        prompt: 'Generate 4 push exercises for a workout. Return as a JSON object with message and exercises array.',
        schema: TestSchema,
        temperature: 0.7,
        maxRetries: 1,
      });

      console.log(`\n✅ SUCCESS! Model ${modelName} works!`);
      console.log('\nResponse:', JSON.stringify(result.object, null, 2));
      console.log(`\n✨ Use this model name in your code: "${modelName}"`);
      process.exit(0);

    } catch (error) {
      console.log(`❌ Model ${modelName} failed:`, error instanceof Error ? error.message : String(error));
      continue;
    }
  }

  // If we get here, none worked
  console.error('\n❌ ALL MODELS FAILED! None of the models work with this API key.');
  console.error('\n🔑 Possible issues:');
  console.error('   1. API key is invalid');
  console.error('   2. Gemini API not enabled in your Google Cloud project');
  console.error('   3. Model names have changed - check Google AI Studio docs');
  console.error('\n💡 Solution: Generate a new API key at https://aistudio.google.com/app/apikey');
  process.exit(1);
}

// Run test
testGeminiAPI();

