import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Développement local : sert /api/stats comme le fera Vercel, avec une base Postgres en mémoire (PGlite),
 * pour ne jamais mélanger les essais aux vraies statistiques. La vue admin y est ouverte sans connexion.
 */
function devStatsApi(): Plugin {
  return {
    name: 'ame-dev-stats-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/stats', async (req, res) => {
        const g = globalThis as { __AME_DEV_DB?: unknown }
        if (!g.__AME_DEV_DB) {
          const { PGlite } = await import('@electric-sql/pglite')
          const pg = new PGlite()
          g.__AME_DEV_DB = async (text: string, params: unknown[] = []) => (await pg.query(text, params)).rows
        }
        ;(globalThis as { __AME_DEV_ADMIN?: boolean }).__AME_DEV_ADMIN = true
        const mod = (await server.ssrLoadModule('/api/stats.ts')) as Record<string, (r: Request) => Promise<Response>>
        const handler = mod[req.method ?? 'GET']
        if (!handler) {
          res.statusCode = 405
          res.end()
          return
        }
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const headers = new Headers()
        for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
        const request = new Request(`http://localhost${req.originalUrl ?? req.url}`, {
          method: req.method,
          headers,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response = await handler(request)
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devStatsApi()],
})
