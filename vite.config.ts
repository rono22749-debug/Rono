import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      // Copies standalone vanilla assets (style.css, script.js, audio/) into dist/
      // so both direct index.html opening and production static serving work identically.
      {
        name: 'copy-standalone-universe-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          if (!fs.existsSync(distDir)) {
            return;
          }
          for (const file of ['style.css', 'script.js']) {
            const srcFile = path.resolve(__dirname, file);
            if (fs.existsSync(srcFile)) {
              fs.copyFileSync(srcFile, path.resolve(distDir, file));
            }
          }
          const srcAudio = path.resolve(__dirname, 'audio');
          const distAudio = path.resolve(distDir, 'audio');
          if (fs.existsSync(srcAudio)) {
            fs.cpSync(srcAudio, distAudio, {recursive: true, force: true});
          }
        },
      },
    ],
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
