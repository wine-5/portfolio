import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// GitHub Pages (wine-5/portfolio) 配下で配信するため base を固定
export default defineConfig({
  base: '/portfolio/',
  resolve: {
    alias: {
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
  },
});
