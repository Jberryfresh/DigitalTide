/**
 * List available Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../src/config/index.js';

async function listModels() {
  try {
    console.log('🔍 Fetching available Gemini models...\n');

    const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey);

    // List all models
    const models = await genAI.listModels();

    console.log('✅ Available Models:\n');
    for (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.error(error);
  }
}

listModels();
