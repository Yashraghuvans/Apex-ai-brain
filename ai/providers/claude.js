import Anthropic from '@anthropic-ai/sdk';
import * as logger from '../../utils/logger.js';

export class ClaudeProvider {
  constructor(apiKey, model) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    this.provider = 'claude';
    this.model = model || 'claude-3-haiku-20240307';
    this.client = new Anthropic({ apiKey });
  }

  async complete(prompt, options = {}) {
    try {
      const message = await this.client.messages.create({
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
      });

      return {
        text: message.content[0].text,
        tokens: {
          input: message.usage.input_tokens || 0,
          output: message.usage.output_tokens || 0,
          total: (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0)
        },
        model: this.model,
        provider: this.provider
      };
    } catch (error) {
      logger.error(`Claude complete error: ${error.message}`);
      throw error;
    }
  }

  async stream(prompt, options = {}, onChunk) {
    try {
      const stream = await this.client.messages.create({
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        stream: true,
      });

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          const chunk = messageStreamEvent.delta.text;
          fullText += chunk;
          if (onChunk) onChunk(chunk);
        } else if (messageStreamEvent.type === 'message_start') {
          inputTokens = messageStreamEvent.message.usage.input_tokens;
        } else if (messageStreamEvent.type === 'message_delta') {
          outputTokens = messageStreamEvent.usage.output_tokens;
        }
      }

      return {
        text: fullText,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        model: this.model,
        provider: this.provider
      };
    } catch (error) {
      logger.error(`Claude stream error: ${error.message}`);
      throw error;
    }
  }
}
