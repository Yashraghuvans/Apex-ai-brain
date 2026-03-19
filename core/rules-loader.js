/**
 * Rules Loader - Loads and manages Salesforce rules for AI prompt injection
 * Provides strict enforcement rules to AI agents during code generation
 * 
 * Core rules are ALWAYS loaded and injected (non-negotiable)
 * Other rules are loaded on demand based on context
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RulesLoader {
    constructor() {
        this.rules = new Map();
        this.loaded = false;
        this.coreLoaded = false;
        this.categories = {
            'core': [],
            'apex': [],
            'testing': [],
            'deployment': [],
            'security': []
        };
        this.rulesDir = path.join(__dirname, '..', 'rules');
        
        // Core rules are ALWAYS injected
        this.coreRules = [
            'no-logic-in-triggers',
            'always-bulkify',
            'governor-limits',
            'fsd-structure'
        ];
    }

    /**
     * Load all rules from disk (async)
     */
    async loadAll() {
        if (this.loaded) return this.rules;

        for (const [category, _] of Object.entries(this.categories)) {
            const categoryPath = path.join(this.rulesDir, category);
            
            try {
                const files = await fs.readdir(categoryPath);
                const mdFiles = files.filter(f => f.endsWith('.md'));

                for (const file of mdFiles) {
                    const filePath = path.join(categoryPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const ruleName = file.replace('.md', '');
                    const key = `${category}/${ruleName}`;
                    const isCore = category === 'core' && this.coreRules.includes(ruleName);

                    this.rules.set(key, {
                        name: ruleName,
                        category,
                        path: filePath,
                        content,
                        enabled: true,
                        isCore,
                        size: content.length
                    });

                    this.categories[category].push({
                        name: ruleName,
                        isCore
                    });
                }
            } catch (e) {
                console.warn(`Rules category not found: ${categoryPath}`);
            }
        }

        this.loaded = true;
        await this.ensureCoreLoaded();
        return this.rules;
    }

    /**
     * Load core rules immediately (non-negotiable, async)
     * Called on initialization - ensures core rules are always available
     */
    async loadCore() {
        if (this.coreLoaded) return;

        for (const ruleName of this.coreRules) {
            const category = 'core';
            const filePath = path.join(this.rulesDir, category, `${ruleName}.md`);
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const key = `${category}/${ruleName}`;

                this.rules.set(key, {
                    name: ruleName,
                    category,
                    path: filePath,
                    content,
                    enabled: true,
                    isCore: true,
                    size: content.length
                });
            } catch (e) {
                throw new Error(`CRITICAL: Core rule not found: ${ruleName}`);
            }
        }

        this.coreLoaded = true;
    }

    /**
     * Ensure core rules are loaded (idempotent, async)
     */
    async ensureCoreLoaded() {
        if (!this.coreLoaded) {
            await this.loadCore();
        }
    }

    /**
     * Load a specific rule (async)
     */
    async load(ruleName, category = 'core') {
        const key = `${category}/${ruleName}`;
        if (this.rules.has(key)) {
            return this.rules.get(key);
        }

        const filePath = path.join(this.rulesDir, category, `${ruleName}.md`);
        
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const isCore = category === 'core' && this.coreRules.includes(ruleName);
            
            const rule = {
                name: ruleName,
                category,
                path: filePath,
                content,
                enabled: true,
                isCore,
                size: content.length
            };

            this.rules.set(key, rule);
            return rule;
        } catch (e) {
            throw new Error(`Rule not found: ${key}`);
        }
    }

    /**
     * Get rules in a category
     */
    get(category) {
        const categoryRules = [];
        for (const [key, rule] of this.rules.entries()) {
            if (rule.category === category && rule.enabled) {
                categoryRules.push(rule);
            }
        }
        return categoryRules;
    }

    /**
     * Get content of a rule (for prompt injection)
     */
    getContent(ruleName, category = 'core') {
        const rule = this.rules.get(`${category}/${ruleName}`);
        if (!rule) {
            throw new Error(`Rule not found: ${category}/${ruleName}`);
        }
        return rule.content;
    }

    /**
     * Get injectable core rules (ALWAYS ON)
     * These are non-negotiable rules injected into every AI prompt
     */
    async getInjectableCore() {
        await this.ensureCoreLoaded();
        
        let injectable = '# NON-NEGOTIABLE ENFORCEMENT RULES\n\n';
        injectable += '## These rules are ALWAYS active. Violation = Code rejection.\n\n';

        for (const ruleName of this.coreRules) {
            const rule = this.rules.get(`core/${ruleName}`);
            if (rule) {
                injectable += `\n${rule.content}\n\n`;
                injectable += '---\n\n';
            }
        }

        return injectable;
    }

    /**
     * Get injectable rules for specific context
     */
    async getInjectableForContext(context) {
        await this.ensureCoreLoaded();
        
        // Map contexts to relevant rule categories
        const contextRules = {
            'apex-generation': ['core', 'apex', 'security'],
            'trigger-generation': ['core', 'apex'],
            'test-generation': ['testing'],
            'deploy': ['deployment'],
            'security-audit': ['security', 'core']
        };

        const categories = contextRules[context] || ['core'];
        let injectable = '';

        for (const category of categories) {
            const rules = this.get(category);
            for (const rule of rules) {
                if (rule.enabled) {
                    injectable += `\n${rule.content}\n\n---\n\n`;
                }
            }
        }

        return injectable;
    }

    /**
     * Get injectable content for all rules
     */
    async getInjectable() {
        await this.loadAll();
        
        let injectable = '# ENFORCEMENT RULES\n\n';

        for (const category of Object.keys(this.categories)) {
            injectable += `\n## Category: ${category}\n`;
            const rules = this.get(category);
            for (const rule of rules) {
                injectable += `\n${rule.content}\n\n`;
            }
        }

        return injectable;
    }

    /**
     * Get summary of all rules
     */
    getSummary() {
        return {
            totalLoaded: this.rules.size,
            allLoaded: this.loaded,
            coreLoaded: this.coreLoaded,
            coreRulesCount: this.coreRules.length,
            byCategory: {
                'core': this.get('core').length,
                'apex': this.get('apex').length,
                'testing': this.get('testing').length,
                'deployment': this.get('deployment').length,
                'security': this.get('security').length
            },
            coreRules: this.coreRules,
            totalSize: Array.from(this.rules.values())
                .reduce((sum, rule) => sum + rule.size, 0)
        };
    }

    /**
     * Activate specific rule
     */
    activate(ruleName, category = 'core') {
        const key = `${category}/${ruleName}`;
        const rule = this.rules.get(key);
        if (rule) {
            rule.enabled = true;
        }
    }

    /**
     * Deactivate specific rule (except core rules - always on)
     */
    deactivate(ruleName, category = 'core') {
        if (category === 'core' && this.coreRules.includes(ruleName)) {
            throw new Error(`Cannot deactivate core rule: ${ruleName}`);
        }
        const key = `${category}/${ruleName}`;
        const rule = this.rules.get(key);
        if (rule) {
            rule.enabled = false;
        }
    }
}

// Export singleton and class
const rulesLoader = new RulesLoader();

export { RulesLoader };
export default rulesLoader;

// Export async convenience functions
export async function loadAllRules() {
    await rulesLoader.loadAll();
    return rulesLoader.rules;
}

export async function loadCoreRules() {
    await rulesLoader.loadCore();
    return await rulesLoader.getInjectableCore();
}

export async function getRule(name, category = 'core') {
    return await rulesLoader.load(name, category);
}

export function getRuleContent(name, category = 'core') {
    return rulesLoader.getContent(name, category);
}

export async function getInjectableRules() {
    return await rulesLoader.getInjectable();
}

export async function getInjectableCoreRules() {
    return await rulesLoader.getInjectableCore();
}

export async function getContextRules(context) {
    return await rulesLoader.getInjectableForContext(context);
}

export function getRulesSummary() {
    return rulesLoader.getSummary();
}
