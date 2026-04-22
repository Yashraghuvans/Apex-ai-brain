export class ModelRouter {
  constructor() {
    this.mode = 'auto'; // 'auto' or 'manual'
  }

  setMode(mode) {
    this.mode = mode;
  }

  route(task) {
    if (this.mode === 'manual') {
      return null; // Signals the client to use default/active settings
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
      complexity = 'medium'; // Long inputs bump up complexity
    }

    switch (complexity) {
      case 'complex':
        return { provider: 'gemini', model: 'gemini-1.5-pro' }; // fallback to claude-3-opus-20240229 if needed
      case 'medium':
        return { provider: 'gemini', model: 'gemini-1.5-pro' }; // fallback to claude-3-sonnet-20240229
      case 'simple':
      default:
        return { provider: 'gemini', model: 'gemini-1.5-flash' }; // fallback to claude-3-haiku-20240307
    }
  }

  resolveModel(logicalName) {
    const map = {
      'simple': 'gemini-1.5-flash',
      'medium': 'gemini-1.5-pro',
      'complex': 'gemini-1.5-pro'
    };
    return map[logicalName] || logicalName;
  }
}

export const modelRouter = new ModelRouter();
