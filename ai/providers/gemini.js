import { GoogleGenerativeAI } from '@google/generative-ai';
import * as logger from '../../utils/logger.js';

export class GeminiProvider {
  constructor(apiKey, model) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.provider = 'gemini';
    this.model = model || 'gemini-1.5-flash';
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(prompt, options = {}) {
    try {
      const genModel = this.client.getGenerativeModel({ model: this.model });
      const result = await genModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const usageMetadata = response.usageMetadata || {};
      
      return {
        text,
        tokens: {
          input: usageMetadata.promptTokenCount || 0,
          output: usageMetadata.candidatesTokenCount || 0,
          total: usageMetadata.totalTokenCount || 0
        },
        model: this.model,
        provider: this.provider
      };
    } catch (error) {
      logger.error(`Gemini complete error: ${error.message}`);
      throw error;
    }
  }

  async stream(prompt, options = {}, onChunk) {
    try {
      const genModel = this.client.getGenerativeModel({ model: this.model });
      const result = await genModel.generateContentStream(prompt);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) onChunk(chunkText);
      }
      
      const response = await result.response;
      const usageMetadata = response.usageMetadata || {};
      
      return {
        text: fullText,
        tokens: {
          input: usageMetadata.promptTokenCount || 0,
          output: usageMetadata.candidatesTokenCount || 0,
          total: usageMetadata.totalTokenCount || 0
        },
        model: this.model,
        provider: this.provider
      };
    } catch (error) {
      logger.error(`Gemini stream error: ${error.message}`);
      throw error;
    }
  }
}
