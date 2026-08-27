import { downsampleMinMax, parseMiniSeed } from './miniseed'

export type QuakeFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    publicID: string
    time: string
    depth: number
    magnitude: number
    mmi: number
    locality: string
    quality: string
  }
}

export type VolcanoFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    volcanoID: string
    volcanoTitle: string
    level: number
    acc: string
    activity: string
    hazards: string
  }
}

export type CameraFeature = {
  type: 'Feature'
  id: string
  geometry: { type: 'Point'; coordinates: [number, number] }
  'volcano-id'?: string[]
  'volcano-title'?: string[]
  properties: {
    title: string
    'latest-image-medium': string
    'latest-image-thumb': string
    'latest-image-large': string
    'latest-timestamp': string
    height?: number
    azimuth?: number
  }
}

export type TildeSeries = {
  data: Array<{ val: number; err: number; qc: string; ts: string }>
  series: {
    domain: string
    station: string
    name: string
    sensorCode: string
    method: string
    aspect: string
  }
  valueUnit?: string
  latitude?: number
  longitude?: number
}

export type StationKind = 'seismic' | 'geomag' | 'gnss' | 'dart' | 'coastal' | 'envirosensor' | 'scandoas'

export type StationPoint = {
  code: string
  name: string
  lat: number
  lon: number
  elevation: number
  kinds: StationKind[]
}

export type TildeSeriesRef = {
  domain: string
  station: string
  name: string
  sensorCode: string
  method: string
  aspect: string
  locality?: string
  lat?: number
  lon?: number
  period: '6h' | '1d' | '7d'
  latestRecord?: string
}

export type ChannelInfo = {
  location: string
  channel: string
  sensor: string
  scale: number
  units: string
  sampleRate: number
}

export type WaveformTrace = {
  channel: string
  location: string
  sensor: string
  units: string
  sampleRate: number
  startMs: number
  times: number[]
  values: number[]
  displayUnit: string
  updatedMs: number
}

export type MagBuckets = Record<string, number>

export type QuakeStats = {
  days7: MagBuckets
  days28: MagBuckets
}

export type NewsItem = {
  title: string
  type: string
  tag: string
  published: string
  link: string
}

const DEV = import.meta.env.DEV
const API = DEV ? '/proxy/api' : 'https://api.geonet.org.nz'
const IMAGES = DEV ? '/proxy/images' : 'https://images.geonet.org.nz'
const TILDE = DEV ? '/proxy/tilde' : 'https://tilde.geonet.org.nz'
const FDSN = DEV ? '/proxy/fdsn' : 'https://service.geonet.org.nz'
const FDSN_NRT_BASE = DEV ? '/proxy/nrt' : 'https://service-nrt.geonet.org.nz'

function bundled(file: string): string {
  return `${import.meta.env.BASE_URL}data/${file}`
}

const TILDE_DOMAINS = ['geomag', 'gnss', 'dart', 'coastal', 'envirosensor', 'scandoas'] as const

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function fetchQuakes(mmi = -1): Promise<QuakeFeature[]> {
  const data = await getJson<{ features: QuakeFeature[] }>(`${API}/quake?MMI=${mmi}`, {
    headers: { Accept: 'application/vnd.geo+json;version=2' },
  })
  return data.features ?? []
}

export async function fetchQuakeStats(): Promise<QuakeStats> {
  const data = await getJson<{
    magnitudeCount: { days7: MagBuckets; days28: MagBuckets }
  }>(`${API}/quake/stats`)
  return {
    days7: data.magnitudeCount?.days7 ?? {},
    days28: data.magnitudeCount?.days28 ?? {},
  }
}

export async function fetchFeltReportCount(): Promise<number> {
  const data = await getJson<{ features: Array<{ properties?: { count?: number } }> }>(
    `${API}/intensity?type=reported`,
  )
  return (data.features ?? []).reduce((n, f) => n + (f.properties?.count ?? 0), 0)
}

export async function fetchVolcanoAlerts(): Promise<VolcanoFeature[]> {
  const data = await getJson<{ features: VolcanoFeature[] }>(`${API}/volcano/val`, {
    headers: { Accept: 'application/vnd.geo+json;version=2' },
  })
  return data.features ?? []
}

export async function fetchCameras(): Promise<CameraFeature[]> {
  try {
    const groups = await getJson<Array<{ features?: CameraFeature[] }>>(
      `${IMAGES}/volcano/cameras/all.json`,
    )
    return groups.flatMap((g) => g.features ?? [])
  } catch {
    const groups = await getJson<Array<{ features?: CameraFeature[] }>>(bundled('cameras.json'))
    return groups.flatMap((g) => g.features ?? [])
  }
}

export async function fetchNews(): Promise<NewsItem[]> {
  const data = await getJson<{ feed?: NewsItem[] }>(`${API}/news/geonet`)
  return data.feed ?? []
}

export function cameraImageUrl(path: string, bust = Date.now()): string {
  if (path.startsWith('http')) {
    const join = path.includes('?') ? '&' : '?'
    return `${path}${join}t=${bust}`
  }
  const cleaned = path.replace(/^\//, '').replace(/^latest\//, '')
  return `${IMAGES}/volcano/cameras/latest/${cleaned}?t=${bust}`
}

export async function fetchGeomagLatest(
  station = 'EYWM',
  period: '6h' | '1d' | '2d' = '1d',
): Promise<TildeSeries | null> {
  const data = await getJson<TildeSeries[]>(
    `${TILDE}/v4/data/geomag/${station}/magnetic-field/50/60s/F-total-field/latest/${period}`,
  )
  return data[0] ?? null
}

export async function fetchActiveStations(): Promise<StationPoint[]> {
  const today = new Date().toISOString().slice(0, 10)
  const url = `${FDSN}/fdsnws/station/1/query?network=NZ&format=text&level=station&endafter=${today}`
  let text = ''
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`FDSN station ${res.status}`)
    text = await res.text()
  } catch {
    text = await fetch(bundled('stations.txt'), { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error(`bundled stations ${r.status}`)
      return r.text()
    })
  }

  return text
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line): StationPoint => {
      const parts = line.split('|')
      return {
        code: parts[1],
        lat: Number(parts[2]),
        lon: Number(parts[3]),
        elevation: Number(parts[4]),
        name: parts[5] || parts[1],
        kinds: ['seismic'],
      }
    })
    .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon))
}

function tildePeriod(domain: string): '6h' | '1d' | '7d' {
  if (domain === 'gnss' || domain === 'scandoas') return '7d'
  if (domain === 'envirosensor') return '1d'
  return '6h'
}

function seriesScore(ref: TildeSeriesRef): number {
  const ageH = ref.latestRecord ? (Date.now() - new Date(ref.latestRecord).getTime()) / 3_600_000 : 9999
  const stale = ageH > 48 ? 40 : ageH > 8 ? 12 : 0
  const { domain, name, method, aspect, sensorCode } = ref
  let base = 3
  if (domain === 'geomag') {
    base = name === 'magnetic-field' && aspect === 'F-total-field' && method === '60s' ? 0 : 8
  } else if (domain === 'gnss') {
    base = name === 'displacement' && aspect === 'up' && method === '1d' ? 0 : 8
  } else if (domain === 'dart' || domain === 'coastal') {
    if (name === 'water-height' && method === '15s') base = sensorCode === '40' ? 0 : 1
    else if (name === 'water-height') base = 5
    else base = 12
  } else if (domain === 'envirosensor') {
    const prefer = ['air-SO2-conc', 'fumarole-temperature', 'lake-height', 'ground-tilt', 'air-CO2-conc']
    const i = prefer.indexOf(name)
    base = i === -1 ? 20 : i
  }
  return base + stale
}

type TildeSummaryStation = {
  station: string
  stationLocality?: string
  latitude?: number
  longitude?: number
  stationElevationM?: number
  sensorCodes?: Record<
    string,
    {
      names?: Record<
        string,
        { methods?: Record<string, { aspects?: Record<string, unknown> }> }
      >
    }
  >
}

export async function fetchTildeCatalog(): Promise<Record<string, TildeSeriesRef[]>> {
  const byStation: Record<string, TildeSeriesRef[]> = {}
  const results = await Promise.all(
    TILDE_DOMAINS.map(async (domain) => {
      try {
        const data = await getJson<{ domain?: Record<string, { stations?: Record<string, TildeSummaryStation> }> }>(
          `${TILDE}/v4/dataSummary/${domain}`,
        )
        return { domain, stations: data.domain?.[domain]?.stations ?? {} }
      } catch {
        return { domain, stations: {} as Record<string, TildeSummaryStation> }
      }
    }),
  )

  for (const { domain, stations } of results) {
    for (const [code, stn] of Object.entries(stations)) {
      const refs: TildeSeriesRef[] = []
      for (const [sensorCode, sensor] of Object.entries(stn.sensorCodes ?? {})) {
        for (const [name, named] of Object.entries(sensor.names ?? {})) {
          for (const [method, meth] of Object.entries(named.methods ?? {})) {
            for (const [aspect, aspectMeta] of Object.entries(meth.aspects ?? {})) {
              const latestRecord =
                aspectMeta && typeof aspectMeta === 'object' && 'latestRecord' in aspectMeta
                  ? String((aspectMeta as { latestRecord?: string }).latestRecord ?? '')
                  : undefined
              refs.push({
                domain,
                station: code,
                name,
                sensorCode,
                method,
                aspect,
                locality: stn.stationLocality,
                lat: stn.latitude,
                lon: stn.longitude,
                period: tildePeriod(domain),
                latestRecord,
              })
            }
          }
        }
      }
      refs.sort((a, b) => seriesScore(a) - seriesScore(b))
      const picked: TildeSeriesRef[] = []
      const seen = new Set<string>()
      for (const ref of refs) {
        const key = `${ref.domain}:${ref.name}:${ref.aspect}`
        if (seen.has(key)) continue
        if (picked.filter((p) => p.domain === ref.domain).length >= (domain === 'envirosensor' ? 2 : 1)) continue
        seen.add(key)
        picked.push(ref)
        if (picked.length >= 3) break
      }
      if (!picked.length) continue
      const list = byStation[code] ?? []
      list.push(...picked)
      byStation[code] = list
    }
  }
  return byStation
}

export function mergeStationsWithTilde(
  stations: StationPoint[],
  catalog: Record<string, TildeSeriesRef[]>,
): StationPoint[] {
  const map = new Map(stations.map((s) => [s.code, { ...s, kinds: [...s.kinds] }]))
  const kindOf: Record<string, StationKind> = {
    geomag: 'geomag',
    gnss: 'gnss',
    dart: 'dart',
    coastal: 'coastal',
    envirosensor: 'envirosensor',
    scandoas: 'scandoas',
  }
  for (const [code, refs] of Object.entries(catalog)) {
    const kinds = [...new Set(refs.map((r) => kindOf[r.domain]).filter(Boolean))] as StationKind[]
    const existing = map.get(code)
    if (existing) {
      for (const k of kinds) {
        if (!existing.kinds.includes(k)) existing.kinds.push(k)
      }
      continue
    }
    const ref = refs.find((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon)) ?? refs[0]
    if (!Number.isFinite(ref.lat) || !Number.isFinite(ref.lon)) continue
    map.set(code, {
      code,
      name: ref.locality || code,
      lat: ref.lat as number,
      lon: ref.lon as number,
      elevation: 0,
      kinds,
    })
  }
  return [...map.values()]
}

export async function fetchTildeSeries(ref: TildeSeriesRef): Promise<TildeSeries | null> {
  const sensor = ref.sensorCode === 'nil' ? '-' : ref.sensorCode
  const aspect = ref.aspect === 'nil' ? '-' : ref.aspect
  const data = await getJson<TildeSeries[]>(
    `${TILDE}/v4/data/${ref.domain}/${ref.station}/${ref.name}/${sensor}/${ref.method}/${aspect}/latest/${ref.period}`,
  )
  return data[0] ?? null
}

const CHANNEL_RANK = ['HHZ', 'BHZ', 'EHZ', 'SHZ', 'HNZ', 'BNZ', 'HHN', 'BHN', 'HHE', 'BHE', 'LHZ']

export async function fetchStationChannels(code: string): Promise<ChannelInfo[]> {
  const today = new Date().toISOString().slice(0, 10)
  const res = await fetch(
    `${FDSN}/fdsnws/station/1/query?network=NZ&station=${encodeURIComponent(code)}&format=text&level=channel&endafter=${today}`,
    { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`FDSN channel ${res.status}`)
  const text = await res.text()
  const open = text
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const p = line.split('|')
      return {
        location: p[2],
        channel: p[3],
        sensor: p[10] || 'Seismometer',
        scale: Number(p[11]) || 1,
        units: p[13] || 'count',
        sampleRate: Number(p[14]) || 0,
        end: p[16] || '',
      }
    })
    .filter((c) => !c.end)
  return open.map(({ end: _end, ...c }) => c)
}

export function pickWaveformChannel(channels: ChannelInfo[]): ChannelInfo | null {
  const ranked = [...channels].sort((a, b) => {
    const ra = CHANNEL_RANK.indexOf(a.channel)
    const rb = CHANNEL_RANK.indexOf(b.channel)
    const sa = ra === -1 ? 50 : ra
    const sb = rb === -1 ? 50 : rb
    if (sa !== sb) return sa - sb
    const loc = (locCode: string) => (locCode === '10' ? 0 : locCode === '00' ? 1 : 2)
    return loc(a.location) - loc(b.location) || b.sampleRate - a.sampleRate
  })
  return ranked[0] ?? null
}

function isoZ(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, '')
}

async function fetchDataselect(
  base: string,
  code: string,
  ch: ChannelInfo,
  start: Date,
  end: Date,
): Promise<ArrayBuffer | null> {
  const loc = ch.location === '' ? '--' : ch.location
  const url = `${base}/fdsnws/dataselect/1/query?network=NZ&station=${encodeURIComponent(code)}&location=${encodeURIComponent(loc)}&channel=${encodeURIComponent(ch.channel)}&starttime=${isoZ(start)}&endtime=${isoZ(end)}`
  const ac = new AbortController()
  const timer = window.setTimeout(() => ac.abort(), 8000)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ac.signal })
    if (res.status === 204 || !res.ok) return null
    const buf = await res.arrayBuffer()
    return buf.byteLength > 64 ? buf : null
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchWaveform(code: string, channel: ChannelInfo): Promise<WaveformTrace | null> {
  const now = new Date()
  const attempts: Array<{ base: string; seconds: number }> = [
    { base: FDSN_NRT_BASE, seconds: 90 },
    { base: FDSN_NRT_BASE, seconds: 180 },
    { base: FDSN, seconds: 180 },
  ]
  let buf: ArrayBuffer | null = null
  for (const attempt of attempts) {
    buf = await fetchDataselect(attempt.base, code, channel, new Date(now.getTime() - attempt.seconds * 1000), now)
    if (buf) break
  }
  if (!buf) return null
  const trace = parseMiniSeed(buf)
  if (!trace?.samples.length) return null

  const times = trace.samples.map((_, i) => trace.startMs + (i * 1000) / trace.sampleRate)
  let values = trace.samples.map((v) => v / (channel.scale || 1))
  let displayUnit = channel.units
  if (channel.units === 'm/s') {
    values = values.map((v) => v * 1e6)
    displayUnit = 'µm/s'
  } else if (channel.units === 'm/s**2' || channel.units === 'm/s^2') {
    values = values.map((v) => v * 1e6)
    displayUnit = 'µm/s²'
  }

  const slim = downsampleMinMax(values, times)
  return {
    channel: trace.channel || channel.channel,
    location: trace.location || channel.location,
    sensor: channel.sensor,
    units: channel.units,
    sampleRate: trace.sampleRate,
    startMs: trace.startMs,
    times: slim.times,
    values: slim.values,
    displayUnit,
    updatedMs: slim.times[slim.times.length - 1] ?? Date.now(),
  }
}

export function cameraLatLon(cam: CameraFeature): [number, number] | null {
  const coords = cam.geometry?.coordinates
  if (!coords || coords.length < 2) return null
  const [a, b] = coords
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (Math.abs(a) <= 90 && Math.abs(b) > 90) return [a, b]
  return [b, a]
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toR = (d: number) => (d * Math.PI) / 180
  const dLat = toR(lat2 - lat1)
  const dLon = toR(lon2 - lon1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function nearbyQuakes(station: StationPoint, quakes: QuakeFeature[], km = 200, limit = 5): QuakeFeature[] {
  return quakes
    .map((q) => {
      const [lon, lat] = q.geometry.coordinates
      return { q, d: haversineKm(station.lat, station.lon, lat, lon) }
    })
    .filter((x) => x.d <= km)
    .sort((a, b) => +new Date(b.q.properties.time) - +new Date(a.q.properties.time))
    .slice(0, limit)
    .map((x) => x.q)
}

export function nearbyCameras(station: StationPoint, cameras: CameraFeature[], km = 90, limit = 2): CameraFeature[] {
  return cameras
    .map((cam) => {
      const ll = cameraLatLon(cam)
      return { cam, d: ll ? haversineKm(station.lat, station.lon, ll[0], ll[1]) : Infinity }
    })
    .filter((x) => x.d <= km)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.cam)
}

export function kindLabel(kind: StationKind): string {
  switch (kind) {
    case 'seismic':
      return 'Ground shaker'
    case 'geomag':
      return 'Earth magnet'
    case 'gnss':
      return 'GPS pin'
    case 'dart':
      return 'Ocean buoy'
    case 'coastal':
      return 'Sea gauge'
    case 'envirosensor':
      return 'Volcano sensor'
    case 'scandoas':
      return 'Volcano gas'
  }
}

export function primaryKind(station: StationPoint): StationKind {
  const order: StationKind[] = ['dart', 'coastal', 'geomag', 'seismic', 'envirosensor', 'scandoas', 'gnss']
  return order.find((k) => station.kinds.includes(k)) ?? station.kinds[0] ?? 'seismic'
}

export function sumMagAtLeast(buckets: MagBuckets, min: number): number {
  return Object.entries(buckets).reduce((n, [key, count]) => {
    return Number(key) >= min ? n + count : n
  }, 0)
}

export function magnitudeRadius(m: number): number {
  if (m >= 5) return 16
  if (m >= 4) return 12
  if (m >= 3) return 9
  return 6
}

/** GeoNet intensity / puia scale used on beta.geonet.org.nz */
export function magnitudeColor(m: number): string {
  if (m >= 6) return '#f03b20'
  if (m >= 5) return '#e83b00'
  if (m >= 4) return '#ff7424'
  if (m >= 3) return '#fdae6b'
  return '#fdd0a2'
}

export function formatMag(m: number): string {
  return `M ${m.toFixed(1)}`
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 48) return `${hrs} h ago`
  const days = Math.floor(hrs / 24)
  return `${days} d ago`
}

export function daysAgo(iso: string, days: number, now = Date.now()): boolean {
  return now - new Date(iso).getTime() <= days * 86400000
}

export function volcanoDisplayName(title: string): string {
  if (title === 'White Island') return 'Whakaari / White Island'
  return title
}

export const FELT_IT_URL = 'https://www.geonet.org.nz/quakes/felt'
export const SEEDLINK_HOST = 'link.geonet.org.nz:18000'
export const KIOSK_WIDTH = 1920
export const KIOSK_HEIGHT = 1080
