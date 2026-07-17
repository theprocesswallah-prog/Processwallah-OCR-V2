import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'frontend/assets/images',
  build: {
    outDir: 'dist'
  }
});
