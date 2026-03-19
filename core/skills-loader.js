/**
 * Skills Loader - Loads and manages Salesforce skills for AI prompt injection
 * Provides comprehensive Salesforce development knowledge to all AI agents
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SkillsLoader {
    constructor() {
        this.skills = new Map();
        this.loaded = false;
        this.categories = {
            'salesforce-core': [],
            'architecture': [],
            'testing': [],
            'performance': [],
            'security': []
        };
        this.skillsDir = path.join(__dirname, '..', 'skills');
    }

    /**
     * Load all skills from disk (async)
     * Called once on initialization
     */
    async loadAll() {
        if (this.loaded) return this.skills;

        for (const [category, _] of Object.entries(this.categories)) {
            const categoryPath = path.join(this.skillsDir, category);
            
            try {
                const files = await fs.readdir(categoryPath);
                const mdFiles = files.filter(f => f.endsWith('.md'));

                for (const file of mdFiles) {
                    const filePath = path.join(categoryPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const skillName = file.replace('.md', '');
                    const key = `${category}/${skillName}`;

                    this.skills.set(key, {
                        name: skillName,
                        category,
                        path: filePath,
                        content,
                        enabled: true,
                        size: content.length
                    });

                    this.categories[category].push(skillName);
                }
            } catch (e) {
                console.warn(`Skills category not found: ${categoryPath}`);
            }
        }

        this.loaded = true;
        return this.skills;
    }

    /**
     * Load a specific skill (async)
     * @param {string} skillName - Skill name without extension
     * @param {string} category - Category (salesforce-core, architecture, testing, performance, security)
     */
    async load(skillName, category = 'salesforce-core') {
        const key = `${category}/${skillName}`;
        if (this.skills.has(key)) {
            return this.skills.get(key);
        }

        const filePath = path.join(this.skillsDir, category, `${skillName}.md`);
        
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const skill = {
                name: skillName,
                category,
                path: filePath,
                content,
                enabled: true,
                size: content.length
            };

            this.skills.set(key, skill);
            return skill;
        } catch (e) {
            throw new Error(`Skill not found: ${key}`);
        }
    }

    /**
     * Get active skills in a category
     * @param {string} category - Category name
     */
    getActive(category) {
        const active = [];
        for (const [key, skill] of this.skills.entries()) {
            if (skill.category === category && skill.enabled) {
                active.push(skill);
            }
        }
        return active;
    }

    /**
     * Activate specific skill
     */
    activate(skillName, category = 'salesforce-core') {
        const key = `${category}/${skillName}`;
        const skill = this.skills.get(key);
        if (skill) {
            skill.enabled = true;
        }
    }

    /**
     * Deactivate specific skill
     */
    deactivate(skillName, category = 'salesforce-core') {
        const key = `${category}/${skillName}`;
        const skill = this.skills.get(key);
        if (skill) {
            skill.enabled = false;
        }
    }

    /**
     * Auto-load all skills on demand (async)
     * Called when AI agent is initialized
     */
    async autoLoad() {
        return await this.loadAll();
    }

    /**
     * Get injectable skill content for prompt
     * Combines all active skills into single injectable string
     * @param {string} category - Category to inject (null = all)
     */
    getInjectable(category = null) {
        let injectable = '# SKILLS - Salesforce Development Knowledge\n\n';

        if (category) {
            const skills = this.getActive(category);
            injectable += `## Category: ${category}\n`;
            for (const skill of skills) {
                injectable += `\n### ${skill.name}\n${skill.content}\n\n`;
            }
        } else {
            for (const cat of Object.keys(this.categories)) {
                injectable += `\n## Category: ${cat}\n`;
                const skills = this.getActive(cat);
                for (const skill of skills) {
                    injectable += `\n### ${skill.name}\n${skill.content}\n\n`;
                }
            }
        }

        return injectable;
    }

    /**
     * Get injectable for specific use case
     * Selects most relevant skills
     */
    async getInjectableForContext(context) {
        const injections = [];

        // Map contexts to relevant skills
        const contextSkills = {
            'apex-generation': ['apex-patterns', 'apex-governor-limits', 'apex-bulkification', 'fsd-architecture'],
            'lwc-generation': ['lwc-patterns', 'fsd-architecture'],
            'trigger-generation': ['apex-patterns', 'apex-security', 'fsd-architecture'],
            'test-generation': ['apex-tdd', 'test-data-factory'],
            'soql-optimization': ['soql-mastery', 'query-optimization'],
            'async-processing': ['async-patterns', 'batch-design'],
            'security-review': ['apex-security', 'sharing-model', 'field-level-security'],
            'integration': ['integration-patterns', 'async-patterns']
        };

        const skills = contextSkills[context] || [];
        for (const skillName of skills) {
            try {
                const skill = await this.load(skillName, 'salesforce-core');
                if (skill.enabled) {
                    injections.push(skill.content);
                }
            } catch (e) {
                // Try other categories
                for (const cat of Object.keys(this.categories)) {
                    try {
                        const skill = await this.load(skillName, cat);
                        if (skill.enabled) {
                            injections.push(skill.content);
                            break;
                        }
                    } catch (e2) {
                        // Continue
                    }
                }
            }
        }

        return injections.join('\n\n---\n\n');
    }

    /**
     * Get summary of all loaded skills
     */
    getSummary() {
        return {
            total: this.skills.size,
            loaded: this.loaded,
            byCategoryCount: {
                'salesforce-core': this.getActive('salesforce-core').length,
                'architecture': this.getActive('architecture').length,
                'testing': this.getActive('testing').length,
                'performance': this.getActive('performance').length,
                'security': this.getActive('security').length
            },
            totalSize: Array.from(this.skills.values())
                .reduce((sum, skill) => sum + skill.size, 0)
        };
    }
}

// Export singleton and class
const skillsLoader = new SkillsLoader();

export { SkillsLoader };
export default skillsLoader;

// Export async convenience functions
export async function loadAllSkills() {
    await skillsLoader.loadAll();
    return skillsLoader.skills;
}

export async function getSkill(name, category = 'salesforce-core') {
    return await skillsLoader.load(name, category);
}

export function getActiveSkills(category) {
    return skillsLoader.getActive(category);
}

export function getInjectableSkills(category) {
    return skillsLoader.getInjectable(category);
}

export async function getContextSkills(context) {
    return await skillsLoader.getInjectableForContext(context);
}

export function getSkillsSummary() {
    return skillsLoader.getSummary();
}
