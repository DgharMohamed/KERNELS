import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function copyStaticWebsiteFiles() {
  return {
    name: 'copy-static-website-files',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const filesToCopy = [
        'learning.html',
        'challenges.html',
        'js/config.js',
        'js/layout.js',
        'js/main.js',
        'src/assets/images/mars_planet_1794704997570.jpg',
      ];

      for (const relPath of filesToCopy) {
        const src = path.resolve(__dirname, relPath);
        const dest = path.resolve(distDir, relPath);
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), {recursive: true});
          fs.copyFileSync(src, dest);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [copyStaticWebsiteFiles()],
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
