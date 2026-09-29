import { getCommandRegistry } from './command-registry.js';
import * as renderer from '../cli/renderer.js';
import chalk from 'chalk';

export function parseInput(input) {
  const parts = input.trim().split(/\s+/);
  
  const options = {};
  const words = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      // Handle --flag=value syntax
      const flagPart = part.substring(2);
      const eqIndex = flagPart.indexOf('=');
      let flagName, flagValue;
      
      if (eqIndex >= 0) {
        flagName = flagPart.substring(0, eqIndex);
        flagValue = flagPart.substring(eqIndex + 1);
      } else {
        flagName = flagPart;
        // Check if next part is a value (not another flag)
        if (i + 1 < parts.length && !parts[i + 1].startsWith('--')) {
          flagValue = parts[i + 1];
          i++; // Skip the value
        } else {
          flagValue = true;
        }
      }
      options[flagName] = flagValue;
    } else {
      words.push(part);
    }
  }
  
  return { words, options };
}

export async function route(words, options) {
  const registry = getCommandRegistry();
  
  // Try to find the longest matching command from the start of the words array
  let foundCmd = null;
  let cmdWordCount = 0;

  for (let i = Math.min(words.length, 3); i > 0; i--) {
    const potentialCmd = words.slice(0, i).join(' ');
    const cmd = registry.find(c => 
      c.command === potentialCmd || 
      c.command === `/${potentialCmd}` ||
      (potentialCmd.startsWith('/') && c.command === potentialCmd)
    );
    
    if (cmd) {
      foundCmd = cmd;
      cmdWordCount = i;
      break;
    }
  }

  if (foundCmd) {
    const args = words.slice(cmdWordCount);
    try {
      await foundCmd.handler(args, options);
    } catch (error) {
      renderer.renderError(`Error executing ${foundCmd.command}: ${error.message}`);
    }
  } else {
    handleUnknown(words[0]);
  }
}

export function handleUnknown(commandName) {
  const registry = getCommandRegistry();
  const suggestion = findSuggestion(commandName, registry);
  
  let msg = `Unknown command: ${commandName}`;
  if (suggestion) {
    msg += `. Did you mean ${chalk.cyan(suggestion)}?`;
  }
  renderer.renderError(msg);
}

function findSuggestion(input, registry) {
  if (!input) return null;
  const cleanInput = input.replace('/', '').toLowerCase();
  for (const cmd of registry) {
    const cleanCmd = cmd.command.replace('/', '').toLowerCase();
    if (cleanCmd.startsWith(cleanInput) || cleanInput.startsWith(cleanCmd)) {
      return cmd.command;
    }
  }
  return null;
}
