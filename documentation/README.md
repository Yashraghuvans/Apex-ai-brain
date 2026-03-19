# Apex AI Brain Documentation

Professional documentation for the Salesforce AI Architect CLI tool built with Docusaurus 3.

## 📚 Structure

```
documentation/
├── docs/                    # Documentation content
│   ├── getting-started/     # Installation & quick start
│   ├── guides/              # How-to guides
│   ├── agents/              # Agent documentation
│   ├── api/                 # API reference
│   ├── concepts/            # Core concepts
│   └── deployment/          # Deployment guides
├── src/
│   └── css/custom.css       # Custom styling
├── docusaurus.config.js     # Configuration
├── sidebars.js              # Navigation structure
└── package.json
```

## 🚀 Quick Start

### Local Development

```bash
npm install
npm start
```

Runs at `http://localhost:3000` with hot reload.

### Build

```bash
npm run build
```

Creates static site in `build/` directory.

### Deploy

```bash
npm run deploy
```

Deploys to GitHub Pages using gh-pages branch.

## 📖 Documentation Sections

### Getting Started
- Installation
- Quick Start  
- First Project Setup
- Environment Configuration

### Guides
- CLI Usage
- Architecture Overview
- Multi-Agent System
- AI Models & Routing
- Guardrails & Security
- Token Tracking
- Memory System

### Agents
- Overview of all 16 agents
- Individual agent documentation
- When to use each agent

### API Reference
- CLI Commands
- Core Modules
- AI Client API
- Memory System API
- Command Registry

### Concepts
- Context Awareness
- Multi-Agent Orchestration
- Guardrails & Security
- Token Management
- Feature-Sliced Design (FSD)

### Deployment
- GitHub Pages Setup
- Building Locally

## 🎨 Customization

### Styling

Edit `src/css/custom.css` to customize:
- Colors (primary, secondary, accent)
- Fonts
- Layout
- Components

### Navigation

Edit `sidebars.js` to modify:
- Menu structure
- Page order
- Groupings

### Configuration

Edit `docusaurus.config.js` for:
- Site metadata
- Search settings
- Plugin configuration
- Theme options

## 🔄 GitHub Actions

Automatic deployment on push to `main`:

Workflow file: `.github/workflows/deploy-docs.yml`

Features:
- Build validation
- Markdown linting
- Auto-deployment to gh-pages
- PR status comments

## 📝 Writing Documentation

### Markdown Format

```markdown
---
sidebar_position: 1
---

# Page Title

Introduction...

## Section

Content...

### Subsection

Details...
```

### Front Matter

```yaml
---
sidebar_position: 1           # Order in sidebar
id: unique-id                 # Page identifier (optional)
slug: /custom-url             # Custom URL (optional)
---
```

### Features

✅ Code syntax highlighting
✅ Callout boxes (note, tip, warning, danger)
✅ Tables
✅ Lists
✅ Links
✅ Images

## 🔍 Search

Powered by Algolia DocSearch:

Configure in `docusaurus.config.js`:

```javascript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'apex-ai-brain',
}
```

## 📱 Mobile Responsive

Fully responsive design:
- Mobile-first approach
- Touch-friendly navigation
- Readable on all screen sizes

## ⚡ Performance

Optimized for speed:
- Static site generation
- CDN-ready
- Minimal dependencies
- Fast page loads

## 🐛 Troubleshooting

### Port in use

```bash
PORT=3001 npm start
```

### Build errors

```bash
rm -rf node_modules
npm ci
npm run build
```

### Clear cache

```bash
npm run clear
```

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io)
- [Markdown Guide](https://www.markdownguide.org)
- [GitHub Pages](https://pages.github.com)

## 🤝 Contributing

To contribute documentation:

1. Clone repository
2. Create feature branch
3. Edit documentation files
4. Test locally: `npm start`
5. Submit pull request

## 📄 License

See [LICENSE](../LICENSE) in root directory.

