// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are two ways to add type annotations for Docusaurus configuration:
// 1. Inline type annotations as JSDoc comments
// 2. Imported types (`TypeScript`)

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Apex AI Brain',
  tagline: 'Enterprise-Grade Salesforce AI Architecture System',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://Yashraghuvans.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Apex-ai-brain/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Yashraghuvans', // Usually your GitHub org/username.
  projectName: 'Apex-ai-brain', // Usually your repo.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/Yashraghuvans/Apex-ai-brain/tree/main/documentation',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/apex-social-card.jpg',
      navbar: {
        title: 'Apex AI Brain',
        logo: {
          alt: 'Apex AI Brain Logo',
          src: 'img/apex-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'documentationSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/Yashraghuvans/Apex-ai-brain',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/getting-started/installation',
              },
              {
                label: 'Guides',
                to: '/guides/cli-usage',
              },
              {
                label: 'Agents',
                to: '/agents/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Yashraghuvans/Apex-ai-brain',
              },
              {
                label: 'Issues',
                href: 'https://github.com/Yashraghuvans/Apex-ai-brain/issues',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/Yashraghuvans/Apex-ai-brain/discussions',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'LICENSE',
                href: 'https://github.com/Yashraghuvans/Apex-ai-brain/blob/main/LICENSE',
              },
              {
                label: 'Contributing',
                href: 'https://github.com/Yashraghuvans/Apex-ai-brain/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Apex AI Brain. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'javascript', 'typescript', 'sql'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'YOUR_APP_ID',

        // Public API key: it is safe to commit it
        apiKey: 'YOUR_API_KEY',

        indexName: 'apex-ai-brain',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the docs should be searchable
        // searchParameters: {
        //   facetFilters: ['language:en'],
        // },

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
    }),
};

export default config;
