import path from 'path';
import { readFile } from '../../utils/file-utils.js';
import * as logger from '../../utils/logger.js';

export async function analyzeProject(scanResult) {
  const { apexClasses, triggers, lwcComponents, metadata, projectType } = scanResult;

  const stats = {
    classCount: apexClasses.length,
    triggerCount: triggers.length,
    lwcCount: lwcComponents.length,
    metadataCount: metadata.length
  };

  const totalFiles = stats.classCount + stats.triggerCount + stats.lwcCount;
  let complexity = 'Small';
  if (totalFiles > 100) complexity = 'Medium';
  if (totalFiles > 500) complexity = 'Large';

  const triggerAnalysis = await analyzeTriggers(triggers);
  const antiPatterns = triggerAnalysis.antiPatterns;

  const framework = await detectTriggerFramework(apexClasses);

  const apexClassNames = apexClasses.map(p => path.basename(p, '.cls'));
  const triggerNames = triggers.map(p => path.basename(p, '.trigger'));
  const lwcNames = lwcComponents.map(c => c.name);

  const summary = `${projectType} project with ${stats.classCount} classes, ${stats.triggerCount} triggers, and ${stats.lwcCount} LWC components. Detected as ${complexity} complexity.`;

  return {
    projectType,
    framework,
    complexity,
    stats,
    antiPatterns,
    apexClassNames,
    triggerNames,
    lwcNames,
    summary
  };
}

async function analyzeTriggers(triggers) {
  const antiPatterns = [];
  const triggerMap = new Map(); // Object -> List of Trigger Names

  for (const triggerPath of triggers) {
    try {
      const content = await readFile(triggerPath);
      const match = content.match(/trigger\s+\w+\s+on\s+(\w+)\s*\(/i);
      if (match) {
        const objectName = match[1].toLowerCase();
        const triggerName = path.basename(triggerPath, '.trigger');
        if (!triggerMap.has(objectName)) {
          triggerMap.set(objectName, []);
        }
        triggerMap.get(objectName).push(triggerName);
      }
    } catch (e) {
      logger.warn(`Could not read trigger file: ${e.message}`);
    }
  }

  for (const [objectName, triggers] of triggerMap.entries()) {
    if (triggers.length > 1) {
      antiPatterns.push(`Multiple triggers on ${objectName}: ${triggers.join(', ')}`);
    }
  }

  return { antiPatterns };
}

async function detectTriggerFramework(apexClasses) {
  const commonFrameworks = ['TriggerHandler', 'fflib', 'SimpleTriggerHandler'];
  for (const className of apexClasses.map(p => path.basename(p, '.cls'))) {
    for (const fw of commonFrameworks) {
      if (className.toLowerCase().includes(fw.toLowerCase())) {
        return fw;
      }
    }
  }
  return 'None/Custom';
}
