import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  publicDir: 'frontend/assets/images',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
