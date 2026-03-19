---
sidebar_position: 1
---

# Deployment to GitHub Pages

Deploy the Apex AI Brain documentation to GitHub Pages.

## Prerequisites

- GitHub account and repository
- Git installed
- Project cloned locally

## Step 1: Configure for GitHub Pages

### Update docusaurus.config.js

Edit the GitHub-specific settings:

```javascript
const config = {
  url: 'https://YOUR_USERNAME.github.io',
  baseUrl: '/Apex-ai-brain/',
  
  organizationName: 'YOUR_USERNAME',
  projectName: 'Apex-ai-brain',
  deploymentBranch: 'gh-pages',
  
  // ... rest of config
};
```

### Replace placeholders:
- `YOUR_USERNAME` → Your GitHub username
- `Apex-ai-brain` → Your repository name

## Step 2: Enable GitHub Pages

1. Go to repository settings
2. Navigate to "Pages" section
3. Select "Deploy from branch"
4. Branch: `gh-pages`
5. Folder: `/ (root)`
6. Save

## Step 3: Build Documentation

```bash
cd documentation
npm install
npm run build
```

This creates:
- `documentation/build/` - Static HTML site
- Ready for deployment

## Step 4: Deploy Options

### Option A: Manual Deployment

```bash
# Build the site
npm run build

# Deploy using docusaurus
npm run deploy
```

### Option B: GitHub Actions (Recommended)

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'documentation/**'
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd documentation
          npm ci
      
      - name: Build
        run: |
          cd documentation
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./documentation/build
```

## Step 5: Configure domain (Optional)

### Custom Domain Setup

1. Get a domain (e.g., apexai.dev)
2. Add DNS records:
   ```
   CNAME apexai.dev something.github.io
   A     185.199.108.153
   A     185.199.109.153
   A     185.199.110.153
   A     185.199.111.153
   ```

3. Create `CNAME` file in repo:
   ```bash
   echo "apexai.dev" > documentation/static/CNAME
   ```

4. Update `docusaurus.config.js`:
   ```javascript
   url: 'https://apexai.dev',
   baseUrl: '/',
   ```

## Step 6: Verification

### After Deployment

1. Visit `https://YOUR_USERNAME.github.io/Apex-ai-brain/`
2. Check GitHub Actions for deployment status
3. Verify docs are live

### Check Deployment Status

```bash
# Via GitHub CLI
gh repo view YOUR_USERNAME/Apex-ai-brain --web

# View deployments
gh deployment list
```

## Ongoing Maintenance

### Update Documentation

1. Edit files in `documentation/docs/`
2. Commit and push to `main` branch
3. GitHub Actions automatically rebuilds and deploys

### Local Testing

Before deploying, test locally:

```bash
cd documentation
npm start
# Visit http://localhost:3000
```

## Troubleshooting

### Site Not Showing

- Check GitHub Pages settings
- Verify `gh-pages` branch exists
- Check GitHub Actions workflow status

### CI/CD Failures

```bash
# View action logs in GitHub UI
# Or check locally:
npm run build --verbose
```

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules package-lock.json build
npm install
npm run build
```

---

## See Also

- [Docusaurus Documentation](https://docusaurus.io)
- [GitHub Pages Guide](https://pages.github.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

