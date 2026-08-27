import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'data')

mkdirSync(outDir, { recursive: true })

const today = new Date().toISOString().slice(0, 10)
const activeTypes = '1,2,3,4,5,6,7,8,9,11,12'

async function save(name, url, headers = {}) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${name} ${res.status} ${url}`)
  const body = Buffer.from(await res.arrayBuffer())
  writeFileSync(join(outDir, name), body)
  console.log(`wrote public/data/${name} (${body.length} bytes)`)
}

await save('cameras.json', 'https://images.geonet.org.nz/volcano/cameras/all.json')

const stationUrl = `https://api.geonet.org.nz/network/station?sensorType=${activeTypes}&startDate=${today}&endDate=${today}`
const stationRes = await fetch(stationUrl, {
  headers: { Accept: 'application/vnd.geo+json;version=2' },
})
if (!stationRes.ok) throw new Error(`stations.json ${stationRes.status} ${stationUrl}`)
const stationData = await stationRes.json()
const slim = {
  type: 'FeatureCollection',
  features: (stationData.features ?? []).map((feature) => ({
    type: 'Feature',
    properties: {
      Code: feature.properties?.Code,
      Name: feature.properties?.Name,
      SensorType: feature.properties?.SensorType,
    },
    geometry: feature.geometry,
  })),
}
writeFileSync(join(outDir, 'stations.json'), JSON.stringify(slim))
console.log(`wrote public/data/stations.json (${slim.features.length} sensors)`)
