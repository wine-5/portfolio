import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import type { ServerResponse } from 'node:http';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
};

/**
 * public/ 外にある実体ディレクトリ(デプロイ時に cp で dist へ入れているもの)を
 * dev / preview サーバーでも本番と同じ URL で配信するプラグイン。
 */
function serveCopiedDirs(dirs: readonly string[]): Plugin {
  const root = fileURLToPath(new URL('.', import.meta.url));
  let base = '/';

  const handler = (
    req: { url?: string },
    res: ServerResponse,
    next: () => void,
  ): void => {
    void (async () => {
      const urlPath = decodeURIComponent((req.url ?? '').split('?')[0] ?? '');
      if (!urlPath.startsWith(base)) return next();

      // base を剥がして正規化し、対象ディレクトリ外へ抜ける参照(.. 等)は弾く
      const rel = path.normalize(urlPath.slice(base.length));
      if (path.isAbsolute(rel) || rel.startsWith('..')) return next();
      const top = rel.split(/[\\/]/, 1)[0] ?? '';
      if (!dirs.includes(top)) return next();

      let filePath = path.join(root, rel);
      let info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        info = await stat(filePath).catch(() => null);
      }
      if (!info?.isFile()) return next();

      res.setHeader(
        'Content-Type',
        MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      );
      createReadStream(filePath).pipe(res);
    })();
  };

  return {
    name: 'serve-copied-dirs',
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

// GitHub Pages (wine-5/portfolio) 配下で配信するため base を固定
export default defineConfig({
  base: '/portfolio/',
  plugins: [serveCopiedDirs(['images', 'web-game', 'downloads'])],
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
