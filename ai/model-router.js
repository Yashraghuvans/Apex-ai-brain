export class ModelRouter {
  constructor() {
    this.mode = 'auto';
  }

  setMode(mode) {
    this.mode = mode;
  }

  route(task) {
    if (this.mode === 'manual') {
      return null;
    }

    const inputLower = (task.command + ' ' + (task.args || []).join(' ')).toLowerCase();
    
    const complexKeywords = ['architect', 'design', 'complex', 'refactor', 'plan', 'bug', 'fix'];
    const mediumKeywords = ['review', 'explain', 'soql', 'why', 'how'];
    
    let complexity = 'simple';
    
    if (task.command === '/plan' || task.command === '/fix' || complexKeywords.some(k => inputLower.includes(k))) {
      complexity = 'complex';
    } else if (task.command === '/review' || task.command === '/explain' || mediumKeywords.some(k => inputLower.includes(k))) {
      complexity = 'medium';
    } else if (inputLower.length > 500) {
      complexity = 'medium';
    }

    switch (complexity) {
      case 'complex':
        return { provider: 'gemini', model: 'gemini-2.5-flash' };
      case 'medium':
        return { provider: 'gemini', model: 'gemini-2.5-flash' };
      case 'simple':
      default:
        return { provider: 'gemini', model: 'gemini-2.5-flash' };
    }
  }

  resolveModel(logicalName) {
    const map = {
      'simple': 'gemini-2.5-flash',
      'medium': 'gemini-2.5-flash',
      'complex': 'gemini-2.5-flash',
      'flash': 'gemini-2.5-flash',
      'pro': 'gemini-2.5-flash'
    };
    return map[logicalName] || logicalName;
  }
}

export const modelRouter = new ModelRouter();
