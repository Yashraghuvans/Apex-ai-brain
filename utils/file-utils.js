import { promises as fs } from 'fs';
import path from 'path';
import { globby } from 'globby';

/**
 * Project root is set once on init, all paths validated against it
 * This prevents agents from accessing files outside the project
 */
let PROJECT_ROOT = process.cwd();

/**
 * Set the project root directory
 * All subsequent file operations are validated against this root
 */
export function setProjectRoot(root) {
  PROJECT_ROOT = path.resolve(root);
}

/**
 * Get the current project root directory
 */
export function getProjectRoot() {
  return PROJECT_ROOT;
}

/**
 * Security validation - ensure path stays inside project root
 * Prevents path traversal attacks and unauthorized file access
 */
export function validatePath(targetPath) {
  const resolved = path.resolve(PROJECT_ROOT, targetPath);
  
  // Ensure resolved path is within project root
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(
      `Security Violation: Cannot access path outside project root.\n` +
      `Attempted: ${resolved}\n` +
      `Allowed root: ${PROJECT_ROOT}`
    );
  }
  
  return resolved;
}

/**
 * Sanitize Apex class name
 * Rules: Start with letter, alphanumeric + underscore, max 40 chars
 */
export function sanitizeClassName(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Class name is required and must be a string');
  }

  const sanitized = input.trim().replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!sanitized) {
    throw new Error('Class name contains no valid characters after sanitization');
  }

  if (!/^[a-zA-Z]/.test(sanitized)) {
    throw new Error('Class name must start with a letter (A-Z)');
  }

  if (sanitized.length > 40) {
    throw new Error(`Class name too long: ${sanitized.length} characters (Salesforce maximum is 40)`);
  }

  return sanitized;
}

/**
 * Sanitize Salesforce object API name
 * Rules: Start with letter, alphanumeric + underscore, no special chars
 */
export function sanitizeObjectName(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Object name is required and must be a string');
  }

  const sanitized = input.trim().replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!sanitized) {
    throw new Error('Object name contains no valid characters after sanitization');
  }

  if (!/^[a-zA-Z]/.test(sanitized)) {
    throw new Error('Object name must start with a letter (A-Z)');
  }

  if (sanitized.endsWith('__c') && sanitized.length > 43) {
    // Custom objects can be up to 43 chars including __c suffix
    throw new Error(`Custom object name too long: ${sanitized.length} characters (Salesforce max is 43)`);
  }

  return sanitized;
}

/**
 * Read file contents with security validation
 */
export async function readFile(filePath) {
  const safe = validatePath(filePath);
  return fs.readFile(safe, 'utf8');
}

/**
 * Write file with security validation
 * Creates directories as needed
 */
export async function writeFile(filePath, content) {
  const safe = validatePath(filePath);
  await fs.mkdir(path.dirname(safe), { recursive: true });
  return fs.writeFile(safe, content, 'utf8');
}

/**
 * Check if file exists with security validation
 */
export async function fileExists(filePath) {
  try {
    const safe = validatePath(filePath);
    await fs.access(safe);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Create directory with security validation
 */
export async function createDir(dirPath) {
  const safe = validatePath(dirPath);
  return fs.mkdir(safe, { recursive: true });
}

/**
 * List files in directory with optional extension filtering
 * Validates path and recursively collects files
 */
export async function listFiles(dir, extensions = []) {
  const safe = validatePath(dir);
  
  try {
    const entries = await fs.readdir(safe, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(safe, entry.name);
      const relativePath = path.relative(PROJECT_ROOT, fullPath);

      if (entry.isDirectory()) {
        // Recursively list files in subdirectories
        const nested = await listFiles(relativePath, extensions);
        files.push(...nested);
      } else if (
        extensions.length === 0 ||
        extensions.includes(path.extname(entry.name))
      ) {
        // Include file if no extension filter or extension matches
        files.push(relativePath);
      }
    }

    return files;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Directory doesn't exist, return empty list
    }
    throw error;
  }
}

/**
 * List files using glob patterns
 * Useful for complex file matching
 */
export async function globFiles(pattern, baseDir = PROJECT_ROOT) {
  const safe = validatePath(baseDir);
  return globby(pattern, {
    cwd: safe,
    gitignore: true,
    onlyFiles: true
  });
}

/**
 * Read JSON file with security validation
 */
export async function readJson(filePath) {
  const content = await readFile(filePath);
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
  }
}

/**
 * Write JSON file with formatting and security validation
 */
export async function writeJson(filePath, data, indent = 2) {
  const content = JSON.stringify(data, null, indent);
  return writeFile(filePath, content);
}

/**
 * Format file path for display
 * Shows relative path if shorter than absolute
 */
export function formatPath(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const relative = path.relative(PROJECT_ROOT, resolved);
    return relative.startsWith('..') ? resolved : relative;
  } catch {
    return filePath;
  }
}

/**
 * Format bytes as human-readable string
 */
export function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath) {
  const safe = validatePath(filePath);
  const stat = await fs.stat(safe);
  return stat.size;
}

/**
 * Get modification time of file
 */
export async function getModTime(filePath) {
  const safe = validatePath(filePath);
  const stat = await fs.stat(safe);
  return stat.mtime;
}
