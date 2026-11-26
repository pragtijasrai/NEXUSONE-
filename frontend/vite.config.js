import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  /* SPA routing — dev server serves index.html for all unknown routes */
  appType: 'spa',

  server: {
    port: 5173,
    strictPort: false,
  },

  build: {
    /* Target modern browsers — reduces polyfill overhead */
    target: 'es2020',

    /* Increase warning threshold (we have recharts which is large) */
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Manual chunks — keep vendor libraries separate from app code.
         * This means recharts/react are cached across app deployments.
         */
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts':   ['recharts'],
          'vendor-icons':    ['lucide-react'],
          'vendor-socket':   ['socket.io-client'],
        },
      },
    },
  },
});
