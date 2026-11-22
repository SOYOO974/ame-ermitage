// Serveur de test local : Vite + toutes les routes api/*.ts, avec les variables de .env.local.
// `vercel dev` plante sous Windows (liens symboliques EPERM). Usage : node scripts/dev-api.mjs (port 5190). Attention : vraie base de production.
import { createServer, loadEnv } from 'vite';

Object.assign(process.env, loadEnv('development', process.cwd(), ''));

const server = await createServer({
  server: { port: 5190, strictPort: true },
  plugins: [
    {
      name: 'all-api',
      configureServer(s) {
        s.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, 'http://localhost:5190');
          const m = url.pathname.match(/^\/api\/([a-z]+)$/);
          if (!m || m[1] === 'stats') return next();
          const mod = await s.ssrLoadModule(`/api/${m[1]}.ts`);
          const handler = mod[req.method];
          if (!handler) return (res.statusCode = 405), res.end();
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
          const response = await handler(new Request(url, { method: req.method, headers, body }));
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        });
      },
    },
  ],
});
await server.listen();
server.printUrls();
