import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Connect, type Plugin } from 'vite';

// Veltix Desk lives in public/desk. On Vercel, vercel.json maps /desk and /pay
// to it. This does the same for `npm run dev` and `npm run preview`, so local
// testing matches production.
function deskRoutes(): Plugin {
  const routes: Record<string, string> = {
    '/desk': '/desk/index.html',
    '/desk/': '/desk/index.html',
    '/pay': '/desk/pay.html',
  };
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const [pathname, query] = (req.url ?? '').split('?');
    const target = routes[pathname];
    if (target) req.url = target + (query ? `?${query}` : '');
    next();
  };
  return {
    name: 'veltix-desk-routes',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// Local dev port. Override with PORT=xxxx if needed; no env vars are required.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react(), tailwindcss(), deskRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port,
    host: true,
  },
  preview: {
    port,
    host: true,
  },
});
