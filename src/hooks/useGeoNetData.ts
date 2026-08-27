import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchActiveStations,
  fetchCameras,
  fetchFeltReportCount,
  fetchGeomagLatest,
  fetchQuakeStats,
  fetchQuakes,
  fetchTildeCatalog,
  fetchVolcanoAlerts,
  mergeStationsWithTilde,
  type CameraFeature,
  type QuakeFeature,
  type QuakeStats,
  type StationPoint,
  type TildeSeries,
  type TildeSeriesRef,
  type VolcanoFeature,
} from '../api/geonet'

export type GeoNetBundle = {
  quakes: QuakeFeature[]
  stats: QuakeStats | null
  feltReports: number
  volcanoes: VolcanoFeature[]
  cameras: CameraFeature[]
  stations: StationPoint[]
  tildeByStation: Record<string, TildeSeriesRef[]>
  geomag: TildeSeries | null
  updatedAt: number
  loading: boolean
  error: string | null
  refresh: () => void
}

const REFRESH_MS = 60_000

export function useGeoNetData(): GeoNetBundle {
  const [quakes, setQuakes] = useState<QuakeFeature[]>([])
  const [stats, setStats] = useState<QuakeStats | null>(null)
  const [feltReports, setFeltReports] = useState(0)
  const [volcanoes, setVolcanoes] = useState<VolcanoFeature[]>([])
  const [cameras, setCameras] = useState<CameraFeature[]>([])
  const [stations, setStations] = useState<StationPoint[]>([])
  const [tildeByStation, setTildeByStation] = useState<Record<string, TildeSeriesRef[]>>({})
  const [geomag, setGeomag] = useState<TildeSeries | null>(null)
  const [updatedAt, setUpdatedAt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [q, st, felt, v, c, s, g, tilde] = await Promise.all([
        fetchQuakes(-1),
        fetchQuakeStats().catch(() => null),
        fetchFeltReportCount().catch(() => 0),
        fetchVolcanoAlerts(),
        fetchCameras(),
        fetchActiveStations().catch(() => [] as StationPoint[]),
        fetchGeomagLatest('EYWM', '1d').catch(() => null),
        fetchTildeCatalog().catch(() => ({} as Record<string, TildeSeriesRef[]>)),
      ])
      setQuakes(q)
      setStats(st)
      setFeltReports(felt)
      setVolcanoes(v)
      setCameras(c)
      setTildeByStation(tilde)
      setStations(mergeStationsWithTilde(s, tilde))
      setGeomag(g)
      setUpdatedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GeoNet data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), REFRESH_MS)
    return () => window.clearInterval(id)
  }, [load])

  return useMemo(
    () => ({
      quakes,
      stats,
      feltReports,
      volcanoes,
      cameras,
      stations,
      tildeByStation,
      geomag,
      updatedAt,
      loading,
      error,
      refresh: () => void load(),
    }),
    [
      quakes,
      stats,
      feltReports,
      volcanoes,
      cameras,
      stations,
      tildeByStation,
      geomag,
      updatedAt,
      loading,
      error,
      load,
    ],
  )
}
