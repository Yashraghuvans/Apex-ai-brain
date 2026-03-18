import path from 'path';

export function buildContext(scanResult, analysisResult) {
  const { apexClasses, triggers, lwcComponents, metadata, projectType, rootDir } = scanResult;
  const { framework, complexity, stats, antiPatterns, apexClassNames, triggerNames, lwcNames } = analysisResult;

  const context = {
    timestamp: new Date().toISOString(),
    projectRoot: rootDir,
    projectType,
    stats,
    allFiles: {
      apexClasses: apexClasses.map(p => path.relative(rootDir, p)),
      triggers: triggers.map(p => path.relative(rootDir, p)),
      lwcComponents: lwcComponents.map(c => ({ name: c.name, path: path.relative(rootDir, c.path) })),
      metadata: metadata.map(p => path.relative(rootDir, p))
    },
    detectedFramework: framework,
    complexity,
    antiPatterns,
    suggestedSkills: suggestSkills(scanResult, analysisResult),
    suggestedAgents: suggestAgents(scanResult, analysisResult)
  };

  return context;
}

function suggestSkills(scanResult, analysisResult) {
  const skills = ['apex-refactoring', 'lwc-debugging'];
  if (analysisResult.stats.triggerCount > 0) {
    skills.push('trigger-optimization');
  }
  if (scanResult.hasSfdxJson) {
    skills.push('sfdx-deployment');
  }
  return skills;
}

function suggestAgents(scanResult, analysisResult) {
  const agents = ['code-reviewer', 'doc-generator'];
  if (analysisResult.complexity === 'Large') {
    agents.push('arch-analyzer');
  }
  if (analysisResult.stats.lwcCount > 0) {
    agents.push('ui-expert');
  }
  return agents;
}
