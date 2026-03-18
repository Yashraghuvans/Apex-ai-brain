export function killAgent(nameOrId, orchestratorRegistry) {
  let targetId = null;
  
  if (orchestratorRegistry.has(nameOrId)) {
    targetId = nameOrId;
  } else {
    // Try to find by name
    for (const [id, agent] of orchestratorRegistry.entries()) {
      if (agent.name === nameOrId) {
        targetId = id;
        break;
      }
    }
  }

  if (targetId) {
    const agent = orchestratorRegistry.get(targetId);
    agent.setStatus('done', 'Agent killed manually.');
    agent.removeAllListeners();
    orchestratorRegistry.delete(targetId);
    return true;
  }
  
  return false;
}
