import { useEffect, useRef, useState } from 'react'
import {
  fetchStationChannels,
  fetchTildeSeries,
  fetchWaveform,
  nearbyCameras,
  nearbyQuakes,
  pickWaveformChannel,
  type CameraFeature,
  type QuakeFeature,
  type StationPoint,
  type TildeSeries,
  type TildeSeriesRef,
  type WaveformTrace,
  type ChartPeriod,
} from '../api/geonet'
import { periodMs } from '../components/PeriodPicker'

export type StationLive = {
  loading: boolean
  waveform: WaveformTrace | null
  waveformError: string | null
  tilde: Array<{ ref: TildeSeriesRef; series: TildeSeries | null; error: string | null }>
  cameras: CameraFeature[]
  quakes: QuakeFeature[]
  sensorName: string | null
}

const EMPTY: StationLive = {
  loading: false,
  waveform: null,
  waveformError: null,
  tilde: [],
  cameras: [],
  quakes: [],
  sensorName: null,
}

export function useStationLive(
  station: StationPoint | null,
  catalog: Record<string, TildeSeriesRef[]>,
  allCameras: CameraFeature[],
  allQuakes: QuakeFeature[],
  period: ChartPeriod = '1d',
): StationLive {
  const [state, setState] = useState<StationLive>(EMPTY)
  const extras = useRef({ station, catalog, allCameras, allQuakes })
  const lastCode = useRef<string | null>(null)

  useEffect(() => {
    extras.current = { station, catalog, allCameras, allQuakes }
  }, [station, catalog, allCameras, allQuakes])

  useEffect(() => {
    const current = extras.current.station
    if (!current) {
      lastCode.current = null
      setState(EMPTY)
      return
    }

    const sameStation = lastCode.current === current.code
    lastCode.current = current.code
    const cams = nearbyCameras(current, extras.current.allCameras)
    const quakes = nearbyQuakes(current, extras.current.allQuakes, 200, 5, Date.now() - periodMs(period))
    const refs = (extras.current.catalog[current.code] ?? []).slice(0, 3)
    let cancelled = false

    setState((prev) => ({
      loading: true,
      waveform: sameStation ? prev.waveform : null,
      waveformError: sameStation ? prev.waveformError : null,
      tilde: refs.map((ref) => ({ ref, series: null, error: null })),
      cameras: cams,
      quakes,
      sensorName: sameStation ? prev.sensorName : null,
    }))

    const load = async () => {
      const wantWave =
        current.kinds.includes('seismic') &&
        !current.kinds.includes('dart') &&
        !current.kinds.includes('coastal')
      const waveTask = wantWave
        ? (async () => {
            try {
              const channels = await fetchStationChannels(current.code)
              const ch = pickWaveformChannel(channels)
              if (!ch) return { waveform: null as WaveformTrace | null, error: 'no-channel', sensor: null as string | null }
              const waveform = await fetchWaveform(current.code, ch)
              if (!waveform) return { waveform: null, error: 'no-data', sensor: ch.sensor }
              return { waveform, error: null, sensor: ch.sensor }
            } catch {
              return { waveform: null, error: 'fail', sensor: null }
            }
          })()
        : Promise.resolve({ waveform: null as WaveformTrace | null, error: null as string | null, sensor: null as string | null })

      const tildeTask = Promise.all(
        refs.map(async (ref) => {
          try {
            const series = await fetchTildeSeries(ref, period)
            return { ref, series, error: series?.data?.length ? null : 'empty' }
          } catch {
            return { ref, series: null, error: 'fail' }
          }
        }),
      )

      void tildeTask.then((tilde) => {
        if (cancelled) return
        setState((prev) => ({ ...prev, tilde, loading: false }))
      })
      void waveTask.then((wave) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          waveform: wave.waveform,
          waveformError: wave.error,
          sensorName: wave.sensor,
        }))
      })
    }

    void load()
    const id = window.setInterval(() => void load(), period === '1d' ? 20_000 : 120_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [station?.code, period])

  return state
}
