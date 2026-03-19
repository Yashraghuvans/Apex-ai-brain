/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a set of docs in the left sidebar
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  documentationSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/first-project',
        'getting-started/environment-setup',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/cli-usage',
        'guides/architecture-overview',
        'guides/multi-agent-system',
        'guides/ai-models',
        'guides/guardrails',
        'guides/token-tracking',
        'guides/memory-system',
      ],
    },
    {
      type: 'category',
      label: 'Agents',
      items: [
        'agents/overview',
        'agents/apex-architect',
        'agents/planner',
        'agents/apex-reviewer',
        'agents/debug-agent',
        'agents/deployment-agent',
        'agents/diff-reviewer',
        'agents/flow-advisor',
        'agents/git-agent',
        'agents/kanban-agent',
        'agents/lwc-builder',
        'agents/memory-agent',
        'agents/metadata-manager',
        'agents/schema-analyst',
        'agents/security-agent',
        'agents/soql-optimizer',
        'agents/test-writer',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/cli-commands',
        'api/core-modules',
        'api/ai-client',
        'api/memory-system',
        'api/command-registry',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/context-awareness',
        'concepts/multi-agent-orchestration',
        'concepts/guardrails-security',
        'concepts/token-management',
        'concepts/fsd-architecture',
        'concepts/limitations',
        'concepts/comparison',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/github-pages',
        'deployment/building-docs',
      ],
    },
  ],
};

export default sidebars;
