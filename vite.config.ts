import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, env.VITE_PERM_KEY)),
        cert: fs.readFileSync(path.resolve(__dirname, env.VITE_PERM_PUB)),
      },
      host: '0.0.0.0',
      watch: {
        usePolling: true
      }
    },
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    plugins: [react({
      include: "**/*.tsx"
    })]
  }
});
