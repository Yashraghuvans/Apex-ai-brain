export class TokenTracker {
  constructor() {
    this.reset();
    
    // Cost per 1k tokens in USD
    this.pricing = {
      'gemini-1.5-flash': { input: 0.000075, output: 0.00030 },
      'gemini-1.5-pro': { input: 0.00125, output: 0.0050 },
      'gemini-2.0-flash': { input: 0.00010, output: 0.00040 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-sonnet-20240229': { input: 0.0030, output: 0.0150 },
      'claude-3-opus-20240229': { input: 0.0150, output: 0.0750 }
    };
  }

  track(response) {
    if (!response || !response.tokens) return;
    
    const { input, output, total } = response.tokens;
    const model = response.model;

    this.stats.totalInput += input;
    this.stats.totalOutput += output;
    this.stats.totalTokens += total;

    if (!this.stats.byModel[model]) {
      this.stats.byModel[model] = { input: 0, output: 0, total: 0, cost: 0 };
    }

    this.stats.byModel[model].input += input;
    this.stats.byModel[model].output += output;
    this.stats.byModel[model].total += total;
    
    const cost = this.getCost(input, output, model);
    this.stats.byModel[model].cost += cost;
    this.stats.estimatedCost += cost;
  }

  getCost(inputTokens, outputTokens, model) {
    const rates = this.pricing[model];
    if (!rates) return 0; // Unknown model pricing
    
    return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
  }

  getSessionStats() {
    return this.stats;
  }

  reset() {
    this.stats = {
      totalInput: 0,
      totalOutput: 0,
      totalTokens: 0,
      estimatedCost: 0,
      byModel: {}
    };
  }

  formatStats() {
    const s = this.stats;
    let output = `Total Tokens: ${s.totalTokens} (In: ${s.totalInput} | Out: ${s.totalOutput})\n`;
    output += `Estimated Session Cost: $${s.estimatedCost.toFixed(4)}\n\n`;
    output += `Breakdown by Model:\n`;
    
    for (const [model, mStats] of Object.entries(s.byModel)) {
      output += `- ${model}: ${mStats.total} tokens ($${mStats.cost.toFixed(4)})\n`;
    }
    
    return output;
  }
}
