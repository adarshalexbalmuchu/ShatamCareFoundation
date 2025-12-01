import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Determine base path for assets
  // Priority:
  // 1) VITE_BASE set explicitly
  // 2) VITE_CUSTOM_DOMAIN flag -> '/'
  // 3) Default GitHub Pages project path
  const explicitBase = process.env.VITE_BASE; // Highest priority override
  const isCustomFlag = process.env.VITE_CUSTOM_DOMAIN === 'true';

  // Detect presence of a CNAME file (GitHub Pages custom domain) and its content
  let hasCustomDomainCNAME = false;
  try {
    if (fs.existsSync(path.resolve(__dirname, 'CNAME'))) {
      const cnameValue = fs.readFileSync(path.resolve(__dirname, 'CNAME'), 'utf8').trim();
      if (cnameValue && !/github\.io$/i.test(cnameValue)) {
        hasCustomDomainCNAME = true;
      }
    }
  } catch (_) {
    // Ignore errors, fallback logic will handle base
  }

  // Default base for GitHub Pages project sites
  let base = '/ShatamCareFoundation/';

  // Resolution priority:
  // 1. Explicit env override (VITE_BASE)
  // 2. Custom domain flag or detected CNAME => '/'
  // 3. Fallback to project path
  if (explicitBase) {
    base = explicitBase;
  } else if (isCustomFlag || hasCustomDomainCNAME) {
    base = '/';
  }
  
  return {
    // Use computed base path
    base,
    server: {
      host: "::",
      port: 5174,
    },
    publicDir: 'public',
    plugins: [react()],
    assetsInclude: ['**/*.ico', '**/*.svg', '**/*.jpg', '**/*.jpeg', '**/*.png'],
    define: {
      // Ensure consistent React environment
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      // Suppress React DevTools suggestion in development
      'process.env.REACT_DEVTOOLS_QUIET': JSON.stringify('true'),
      __DEV__: mode !== 'production',
      __BUILD_BASE__: JSON.stringify(base)
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react": path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
      exclude: ['@radix-ui/react-tooltip'],
      force: true,
      // Ensure React is pre-bundled correctly
      esbuildOptions: {
        target: 'es2020'
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false, // Disable sourcemaps for production
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        external: (id) => {
          // Don't externalize React in our build - keep it bundled to avoid multiple instances
          return false;
        },
        output: {
          format: 'es',
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            // Force all React-related code into a single chunk
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Keep other vendors separate
            'vendor-supabase': ['@supabase/supabase-js'],
            // Admin chunk for admin-related code
          }
        }
      }
    }
  };
});
