/**
 * LWC Command - Generate Lightning Web Components
 * Generates component.js, component.html, component.css with proper lifecycle and patterns
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';
import fs from 'fs/promises';
import path from 'path';

class LwcCommand extends AgentBase {
    constructor() {
        super('lwc');
        this.description = 'Generate Lightning Web Components (SLDS patterns, reactive binding)';
        this.examples = [
            'sfai /lwc generate --name leadForm --type form',
            'sfai /lwc generate --name leadTable --type datatable',
            'sfai /lwc generate --name leadDetail --type detail'
        ];
    }

    async execute(args = {}) {
        const { name, type, action } = args;

        if (!name) {
            throw new Error('--name required: sfai /lwc generate --name leadForm --type form');
        }

        if (action === 'generate') {
            return this.generateLWC(name, type || 'component');
        }

        return this.showUsage();
    }

    async generateLWC(componentName, type) {
        this.logger.start(`Generating LWC ${componentName} (${type})...`);

        try {
            // Inject skills + rules into prompt
            const skills = await skillsLoader.getInjectableForContext('lwc-generation');
            const coreRules = rulesLoader.getInjectableCore();

            const prompt = this.buildPrompt(componentName, type, skills, coreRules);

            // Generate component.js
            const jsCode = await this.callAI(prompt);
            
            // Generate component.html from JS
            const htmlCode = await this.callAI(this.buildHtmlPrompt(componentName, jsCode));
            
            // Generate component.css from context
            const cssCode = await this.callAI(this.buildCssPrompt(componentName));

            // Generate js-meta.xml
            const metaCode = this.generateMeta(componentName);

            // Save all files
            const componentDir = path.join(process.cwd(), 'force-app', 'main', 'default', 'lwc', componentName);
            await this.ensureDir(componentDir);

            await fs.writeFile(path.join(componentDir, `${componentName}.js`), jsCode);
            await fs.writeFile(path.join(componentDir, `${componentName}.html`), htmlCode);
            await fs.writeFile(path.join(componentDir, `${componentName}.css`), cssCode);
            await fs.writeFile(path.join(componentDir, `${componentName}.js-meta.xml`), metaCode);

            this.logger.success(`✅ Generated LWC: ${componentDir}`);
            return {
                success: true,
                path: componentDir,
                files: ['js', 'html', 'css', 'js-meta.xml']
            };

        } catch (error) {
            this.logger.error(`Failed to generate LWC: ${error.message}`);
            throw error;
        }
    }

    buildPrompt(componentName, type, skills, coreRules) {
        const typeDescriptions = {
            'form': 'Form for data entry with validation',
            'datatable': 'Data table with sorting, filtering, inline edit',
            'detail': 'Detail view for single record',
            'component': 'Generic LC web component'
        };

        return `
You are an expert Lightning Web Components developer. Generate production-grade LWC.

${coreRules}

${skills}

## Task
Generate JavaScript for LWC component: ${componentName}
Type: ${typeDescriptions[type]}

Requirements:
- Use connectedCallback lifecycle hook
- Use @wire for reactive data binding
- Use @api for parent→child communication
- Dispatch CustomEvent for child→parent
- Include error handling & error boundaries
- Follow SLDS design patterns
- Show loading spinner while fetching data
- Show empty state when no data
- Include JSDoc comments

Browser: LWC module format (not Aura)
API Version: 62.0

Output ONLY JavaScript code. No explanation.
Start with \`\`\`javascript and end with \`\`\`
        `;
    }

    buildHtmlPrompt(componentName, jsCode) {
        return `
Generate HTML template for LWC component based on this JavaScript:
${jsCode}

Use SLDS patterns:
- lightning-card for containers
- lightning-input for forms
- lightning-button for actions
- lightning-spinner during loading
- Accessible alt text and ARIA labels

Output ONLY HTML template. No explanation.
Start with \`\`\`html and end with \`\`\`
        `;
    }

    buildCssPrompt(componentName) {
        return `
Generate CSS for LWC component: ${componentName}

Use SLDS custom properties:
- --slds-c-button-color-background
- --slds-c-card-spacing-block
- Card and button styling

Responsive design:
- Mobile-first approach
- Flex layout for responsive grids
- Media queries for breakpoints

Output ONLY CSS. No explanation.
Start with \`\`\`css and end with \`\`\`
        `;
    }

    generateMeta(componentName) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__FlowPage</target>
    </targets>
</LightningComponentBundle>`;
    }

    async ensureDir(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }

    showUsage() {
        return `
LWC Command - Generate Lightning Web Components

Usage:
  sfai /lwc generate --name <ComponentName> --type <form|datatable|detail|component>

Types:
  form      - Form for data entry with validation
  datatable - Data table with sorting and filtering
  detail    - Detail view for single record
  component - Generic LWC component

Examples:
  sfai /lwc generate --name leadForm --type form
  sfai /lwc generate --name leadTable --type datatable
  sfai /lwc generate --name leadDetail --type detail

What you get:
  ✓ component.js with lifecycle hooks
  ✓ component.html with SLDS patterns
  ✓ component.css responsive design
  ✓ component.js-meta.xml configuration
  ✓ Error handling & loading states
  ✓ Accessible patterns (@ARIA)
  ✓ Production-ready
        `;
    }
}

export default LwcCommand;
