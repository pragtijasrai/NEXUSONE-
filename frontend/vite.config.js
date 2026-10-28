import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  /* appType: 'spa' tells Vite dev server to serve index.html for all
     routes that don't match a file — this is what makes React Router
     work on hard refresh of /faculty/dashboard, /admin/dashboard etc. */
  appType: 'spa',

  server: {
    port: 5173,
    strictPort: false,
  },
});
