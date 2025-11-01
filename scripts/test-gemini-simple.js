/**
 * Simple Gemini API Test
 * Tests if the API key works with a basic request
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../src/config/index.js';

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API Configuration...\n');
    console.log(
      `API Key: ${config.ai.gemini.apiKey?.substring(0, 10)}...${config.ai.gemini.apiKey?.substring(config.ai.gemini.apiKey.length - 4)}`
    );
    console.log(`Model: ${config.ai.gemini.model}\n`);

    const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey);

    // Try each common model name
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`📝 Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(
          'Say "Hello, I am working!" in 5 words or less.'
        );
        const response = await result.response;
        const text = response.text();

        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log(`Response: ${text}\n`);
        return modelName; // Return the working model name
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`);
      }
    }

    console.log('\n❌ None of the common model names worked.');
    console.log('\n💡 Possible issues:');
    console.log('   1. API key is from Google Cloud Console (need Google AI Studio key)');
    console.log('   2. Generative Language API not enabled');
    console.log('   3. Geographic restrictions (not available in your region)');
    console.log('   4. API key needs time to activate (wait 5-10 minutes)');
    console.log('\n📖 Get correct key from: https://aistudio.google.com/app/apikey');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
  }
}

testGemini();
