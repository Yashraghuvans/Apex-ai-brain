import path from 'path';
import { globby } from 'globby';
import { fileExists } from '../../utils/file-utils.js';

export async function scanProject(rootDir) {
  const options = {
    cwd: rootDir,
    absolute: true,
    dot: true,
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/.sfai/**']
  };

  const [apexClasses, triggers, lwcs, metadata, hasSfdxJson, hasPackageXml, hasForceIgnore] = await Promise.all([
    globby('**/*.cls', options),
    globby('**/*.trigger', options),
    globby('**/lwc/*/', options), // LWC folders
    globby('**/*.xml', options),
    fileExists(path.join(rootDir, 'sfdx-project.json')),
    fileExists(path.join(rootDir, 'package.xml')),
    fileExists(path.join(rootDir, '.forceignore'))
  ]);

  const lwcComponents = lwcs.map(lwcPath => ({
    name: path.basename(lwcPath),
    path: lwcPath
  }));

  return {
    apexClasses,
    triggers,
    lwcComponents,
    metadata,
    projectType: hasSfdxJson ? 'SFDX' : 'Legacy',
    hasSfdxJson,
    hasPackageXml,
    hasForceIgnore,
    rootDir
  };
}
