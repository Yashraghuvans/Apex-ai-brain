---
sidebar_position: 2
---

# Building Documentation Locally

Set up and build documentation on your machine.

## Prerequisites

- Node.js 18+
- npm or yarn
- Text editor

## Local Setup

### 1. Install Dependencies

```bash
cd documentation
npm install
```

### 2. Start Development Server

```bash
npm start
```

Opens at: `http://localhost:3000`

Hot-reloads on changes.

### 3. Make Changes

Edit files in `docs/` directory:

```bash
documentation/
├── docs/
│   ├── intro.md
│   ├── getting-started/
│   ├── guides/
│   ├── agents/
│   └── ...
```

### 4. Preview Changes

Changes auto-refresh in browser.

## Build for Production

### Build Static Site

```bash
npm run build
```

Creates: `documentation/build/`

Ready for deployment!

## Troubleshooting

### Port Already in Use

```bash
PORT=3001 npm start
```

### Clear Cache

```bash
npm run clear
rm -rf node_modules
npm install
npm start
```

### Invalid Configuration

```bash
npm run build --verbose
```

Shows detailed errors.

---

See Also:
- [Deployment Guide](./github-pages.md)
- [Docusaurus Docs](https://docusaurus.io)

