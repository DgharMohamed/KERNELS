import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, type Plugin} from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, '..');

function plainHubAssetsPlugin(): Plugin {
  const assetMime: Record<string, string> = {
    '/hub.js': 'application/javascript; charset=utf-8',
    '/hubData.js': 'application/javascript; charset=utf-8',
    '/hub.css': 'text/css; charset=utf-8',
  };

  const extMime: Record<string, string> = {
    '.wasm': 'application/wasm',
    '.pck': 'application/octet-stream',
    '.js': 'application/javascript; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
  };

  return {
    name: 'plain-hub-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrl = (req.url || '').split('?')[0];

        // Specific hub assets at root
        const mime = assetMime[cleanUrl];
        if (mime) {
          const filePath = path.resolve(projectRoot, '.' + cleanUrl);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', mime);
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.end(fs.readFileSync(filePath, 'utf-8'));
            return;
          }
        }

        // Web build files (/web_build/*)
        if (cleanUrl.startsWith('/web_build/')) {
          const relPath = cleanUrl.replace(/^\/web_build\/?/, '') || 'index.html';
          // Check public/web_build first, then ../web_build
          const targetPaths = [
            path.resolve(projectRoot, 'public', 'web_build', relPath),
            path.resolve(workspaceRoot, 'web_build', relPath),
          ];

          let targetFile = targetPaths.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
          if (!targetFile && (cleanUrl === '/web_build' || cleanUrl === '/web_build/')) {
            targetFile = targetPaths.map(p => path.join(p, 'index.html')).find((p) => fs.existsSync(p));
          }

          if (targetFile) {
            const ext = path.extname(targetFile).toLowerCase();
            const contentType = extMime[ext] || 'application/octet-stream';
            const stat = fs.statSync(targetFile);

            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

            const range = req.headers.range;
            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
              const chunksize = end - start + 1;
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
              });
              fs.createReadStream(targetFile, { start, end }).pipe(res);
              return;
            }

            res.writeHead(200, {
              'Content-Length': stat.size,
              'Accept-Ranges': 'bytes',
              'Content-Type': contentType,
            });
            fs.createReadStream(targetFile).pipe(res);
            return;
          }
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
      include: ['three'],
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(projectRoot, 'index.html'),
          game: path.resolve(projectRoot, 'game.html'),
          learning: path.resolve(projectRoot, 'learning.html'),
        },
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
