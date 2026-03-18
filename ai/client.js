import dotenv from 'dotenv';
import { GeminiProvider } from './providers/gemini.js';
import { ClaudeProvider } from './providers/claude.js';
import * as logger from '../utils/logger.js';
import { TokenTracker } from './token-tracker.js';

dotenv.config();

class UnifiedAIClient {
  constructor() {
    this.activeProviderName = process.env.DEFAULT_PROVIDER || 'gemini';
    this.activeModel = process.env.DEFAULT_MODEL || 'gemini-1.5-flash';
    this.providers = {};
    this.tokenTracker = new TokenTracker();
    this._initializeProviders();
  }

  _initializeProviders() {
    if (process.env.GEMINI_API_KEY) {
      this.providers['gemini'] = new GeminiProvider(process.env.GEMINI_API_KEY, this.activeModel);
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers['claude'] = new ClaudeProvider(process.env.ANTHROPIC_API_KEY, 'claude-3-haiku-20240307');
    }
  }

  getProvider(name) {
    const p = this.providers[name];
    if (!p) throw new Error(`Provider ${name} not configured. Check .env`);
    return p;
  }

  setProvider(name) {
    if (!this.providers[name]) throw new Error(`Provider ${name} not configured.`);
    this.activeProviderName = name;
  }

  setModel(modelName) {
    this.activeModel = modelName;
    if (this.providers[this.activeProviderName]) {
      this.providers[this.activeProviderName].model = modelName;
    }
  }

  async complete(prompt, options = {}) {
    const providerName = options.provider || this.activeProviderName;
    const provider = this.getProvider(providerName);
    
    // Temporarily override model if specified in options
    const originalModel = provider.model;
    if (options.model) provider.model = options.model;

    const response = await provider.complete(prompt, options);
    
    // Restore
    if (options.model) provider.model = originalModel;
    
    this.tokenTracker.track(response);
    return response;
  }

  async stream(prompt, options = {}, onChunk) {
    const providerName = options.provider || this.activeProviderName;
    const provider = this.getProvider(providerName);

    const originalModel = provider.model;
    if (options.model) provider.model = options.model;

    const response = await provider.stream(prompt, options, onChunk);

    if (options.model) provider.model = originalModel;

    this.tokenTracker.track(response);
    return response;
  }

  getStats() {
    return this.tokenTracker.getSessionStats();
  }
}

// Singleton
export const aiClient = new UnifiedAIClient();
