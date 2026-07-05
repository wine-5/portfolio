import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// GitHub Pages (wine-5/portfolio) 配下で配信するため base を固定
export default defineConfig({
  base: '/portfolio/',
  define: {
    // ビルド時点の日付(ローカルタイムゾーン)を最終更新日としてフッターに自動注入する
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('sv-SE')),
  },
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
