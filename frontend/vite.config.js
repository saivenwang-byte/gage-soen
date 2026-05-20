import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appVersion = readFileSync(join(__dirname, '..', 'VERSION'), 'utf8').trim();
const buildDate = new Date().toISOString().slice(0, 10);

/** 手机同 WiFi 测定位时可设 VITE_DEV_HTTPS=1；本机预览默认用 http，避免证书导致白屏 */
const useHttps = process.env.VITE_DEV_HTTPS === '1';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: useHttps ? [react(), basicSsl()] : [react()],
  server: {
    host: true,
    port: 5173,
    https: useHttps,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': { target: 'ws://localhost:3001', ws: true },
    },
  },
});
