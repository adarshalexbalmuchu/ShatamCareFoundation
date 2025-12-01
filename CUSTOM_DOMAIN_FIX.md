# Custom Domain Deployment Guide

## Issue Resolution

The issue you encountered was caused by incorrect asset paths in the built files. The website was trying to load assets from:
- `http://shatamcare.org/ShatamCareFoundation/assets/main-H-0Bnh9n.js`
- `http://shatamcare.org/ShatamCareFoundation/assets/react-vendor-jk5iiwGh.js`
- etc.

But on a custom domain, these assets should be loaded from:
- `http://shatamcare.org/assets/main-H-0Bnh9n.js`
- `http://shatamcare.org/assets/react-vendor-jk5iiwGh.js`
- etc.

## Solution Applied

1. **Fixed Vite Configuration**: Corrected the `vite.config.ts` syntax issues and ensured the base path logic works properly.

2. **Environment Variable Setup**: Set `VITE_CUSTOM_DOMAIN=true` (CI/hosting env var) during the build to use `/` as the base path instead of `/ShatamCareFoundation/`.

3. **Build Commands**: Updated package.json with specific build commands for different deployment targets.

## Deployment Commands

### For Custom Domain (shatamcare.org)
```bash
npm run build:custom-domain
```

### For GitHub Pages (github.io)
```bash
npm run build:github-pages
```

## How It Works

The `vite.config.ts` file now correctly handles different deployment scenarios:

- **Custom Domain**: When `VITE_CUSTOM_DOMAIN=true`, sets base path to `/`
- **GitHub Pages**: Uses `/ShatamCareFoundation/` as base path for project pages
- **Explicit Override**: Can set `VITE_BASE` environment variable for custom paths

## Verification

After building with `npm run build:custom-domain`, the generated `dist/index.html` should have asset paths like:
```html
<script type="module" crossorigin src="/assets/main-C_pAAfoy.js"></script>
<link rel="stylesheet" crossorigin href="/assets/main-BmQHPTZc.css">
```

NOT:
```html
<script type="module" crossorigin src="/ShatamCareFoundation/assets/main-C_pAAfoy.js"></script>
<link rel="stylesheet" crossorigin href="/ShatamCareFoundation/assets/main-BmQHPTZc.css">
```

## Deployment Steps

1. **Build for custom domain**:
   ```bash
   npm run build:custom-domain
   ```

2. **Upload the `dist` folder contents** to your web server/hosting provider for the `shatamcare.org` domain.

3. **Ensure proper server configuration**:
   - The `_headers` and `_redirects` files in the dist folder handle caching and SPA routing
   - Make sure your hosting provider supports these files or configure similar rules

## Files Updated

- `vite.config.ts` - Fixed syntax and ensured proper base path handling
- `package.json` - Added specific build commands
- (Replaced) `.env.production` - Use deployment environment variables instead; file removed to reduce confusion.

Your website should now load properly on `shatamcare.org` without the 404 errors for assets.
