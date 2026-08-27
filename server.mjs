import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || 5173)

const proxies = {
  '/proxy/api': 'https://api.geonet.org.nz',
  '/proxy/images': 'https://images.geonet.org.nz',
  '/proxy/tilde': 'https://tilde.geonet.org.nz',
  '/proxy/nrt': 'https://service-nrt.geonet.org.nz',
  '/proxy/fdsn': 'https://service.geonet.org.nz',
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)

  for (const [prefix, target] of Object.entries(proxies)) {
    if (url.pathname.startsWith(prefix)) {
      const dest = target + url.pathname.slice(prefix.length) + url.search
      try {
        const upstream = await fetch(dest, {
          headers: { accept: req.headers.accept || '*/*' },
        })
        const body = Buffer.from(await upstream.arrayBuffer())
        res.writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') || 'application/octet-stream',
          'cache-control': 'no-store',
        })
        res.end(body)
      } catch {
        res.writeHead(502)
        res.end('GeoNet proxy error')
      }
      return
    }
  }

  let file = path.join(dist, url.pathname === '/' ? 'index.html' : url.pathname)
  if (!file.startsWith(dist)) {
    res.writeHead(403)
    res.end()
    return
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(dist, 'index.html')
  }
  const ext = path.extname(file)
  res.writeHead(200, { 'content-type': mime[ext] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GeoNet kiosk http://0.0.0.0:${PORT}  (1920×1080)`)
})
