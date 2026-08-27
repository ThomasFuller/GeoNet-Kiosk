import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'data')

mkdirSync(outDir, { recursive: true })

const today = new Date().toISOString().slice(0, 10)

async function save(name, url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${name} ${res.status} ${url}`)
  const body = Buffer.from(await res.arrayBuffer())
  writeFileSync(join(outDir, name), body)
  console.log(`wrote public/data/${name} (${body.length} bytes)`)
}

await save('cameras.json', 'https://images.geonet.org.nz/volcano/cameras/all.json')
await save(
  'stations.txt',
  `https://service.geonet.org.nz/fdsnws/station/1/query?network=NZ&format=text&level=station&endafter=${today}`,
)
