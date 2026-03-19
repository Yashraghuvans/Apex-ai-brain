---
sidebar_position: 3
---

# AI Client API

Reference for AI provider integration layer.

## Overview

The AI Client provides a unified interface to multiple AI providers.

## Core Methods

### complete()

Generate one-shot completion.

```javascript
const response = await aiClient.complete(prompt, {
  model: 'claude',
  maxTokens: 2000,
  temperature: 0.7
});

return response.text;
```

### stream()

Generate streaming response.

```javascript
await aiClient.stream(prompt, {}, (chunk) => {
  process.stdout.write(chunk);
});
```

## Configuration

Set default model:

```bash
export DEFAULT_MODEL=claude
# or
SFAI_DEFAULT_MODEL=gemini
```

## Supported Models

- `claude` - Claude 3 (default)
- `gemini` - Google Gemini
- `gpt4` - OpenAI GPT-4 (experimental)

---

See Also: [AI Models Guide](../guides/ai-models.md)

