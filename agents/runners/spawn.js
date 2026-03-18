import path from 'path';
import { readFile } from '../../utils/file-utils.js';
import { AgentBase } from '../agent-base.js';
import matter from 'gray-matter';

export async function spawnAgent(name, orchestratorRegistry) {
  try {
    const filePath = path.join(process.cwd(), 'agents', 'definitions', `${name}.md`);
    const fileContent = await readFile(filePath);
    
    // Parse YAML frontmatter
    const parsed = matter(fileContent);
    const definition = {
      name: parsed.data.name || name,
      description: parsed.data.description || '',
      tools: parsed.data.tools || [],
      model: parsed.data.model || 'medium',
      content: parsed.content
    };

    const agent = new AgentBase(definition);
    
    // Register it
    orchestratorRegistry.set(agent.id, agent);
    
    return agent;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Agent definition '${name}.md' not found.`);
    }
    throw error;
  }
}
