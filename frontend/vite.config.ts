import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server on :5173. /api calls are proxied to the Spring Cloud Gateway
// so the frontend never needs to know individual service ports.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
