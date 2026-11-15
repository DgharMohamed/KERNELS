import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, type Plugin} from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function plainHubAssetsPlugin(): Plugin {
  const assetMime: Record<string, string> = {
    '/hub.js': 'application/javascript; charset=utf-8',
    '/hubData.js': 'application/javascript; charset=utf-8',
    '/hub.css': 'text/css; charset=utf-8',
  };
  return {
    name: 'plain-hub-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrl = (req.url || '').split('?')[0];
        const mime = assetMime[cleanUrl];
        if (!mime) {
          next();
          return;
        }
        const filePath = path.resolve(projectRoot, '.' + cleanUrl);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.end(fs.readFileSync(filePath, 'utf-8'));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [plainHubAssetsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['three'],
    },
    build: {
      rollupOptions: {
        external: ['three', /^three\//],
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
