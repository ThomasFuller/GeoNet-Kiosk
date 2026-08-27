import {
  cameraImageUrl,
  formatMag,
  formatRelativeTime,
  primaryKind,
  stationSensorTypes,
  type CameraFeature,
  type QuakeFeature,
  type StationPoint,
  type TildeSeries,
  type TildeSeriesRef,
} from '../api/geonet'
import { downsampleMinMax } from '../api/miniseed'
import { useStationLive } from '../hooks/useStationLive'
import { AnnotatedChart } from './AnnotatedChart'
import { PeriodPicker, periodCaption, CHART_PERIODS, type ChartPeriod } from './PeriodPicker'
import { SensorTypeIcon } from './SensorTypeIcon'
import './StationSheet.css'

const KIND_BLURB: Record<string, string> = {
  seismic: 'This box in the ground feels tiny shakes — even ones people cannot feel.',
  geomag: 'Earth is a giant magnet. This sensor watches that invisible field.',
  gnss: 'A GPS pin that checks whether the land is slowly creeping.',
  dart: 'A buoy far out at sea, listening for unusual water-height changes.',
  coastal: 'A sea-level gauge on the coast. Quiet water makes a smooth line.',
  envirosensor: 'A volcano-side gadget measuring gas, heat or the ground itself.',
  scandoas: 'This one sniffs volcanic gas riding on the wind.',
}

function tildeCopy(
  ref: TildeSeriesRef,
  period: ChartPeriod,
): {
  title: string
  annotation: string
  yCaption: string
  xCaption: string
  accent: 'puia' | 'val' | 'wai' | 'whenua'
  color: string
} {
  const xCaption = periodCaption(period)
  if (ref.domain === 'geomag') {
    return {
      title: "Earth's magnetic hug",
      annotation: 'The line is how strong Earth’s magnetic field is here. It wiggles a little every day as the Sun and Earth chat.',
      yCaption: 'Strength of the magnetic field. Unit: nanotesla (nT) — a tiny magnetism unit.',
      xCaption,
      accent: 'val',
      color: '#832c82',
    }
  }
  if (ref.domain === 'gnss') {
    return {
      title: 'Is the land creeping?',
      annotation: 'GPS watches this pin. Up means the ground rose a little; down means it settled. Changes are usually smaller than a fingernail.',
      yCaption: 'How far the land has moved up or down, in metres.',
      xCaption,
      accent: 'whenua',
      color: '#b38c65',
    }
  }
  if (ref.domain === 'dart' || ref.domain === 'coastal') {
    return {
      title: 'The water’s height',
      annotation: 'This is the sea surface. A tsunami would look like a sudden, unusual jump — not the gentle tide wobble.',
      yCaption: 'Water height in metres. Scientists compare this with the usual tide.',
      xCaption,
      accent: 'wai',
      color: '#1d4e89',
    }
  }
  if (ref.name.includes('SO2') || ref.domain === 'scandoas') {
    return {
      title: 'Volcano breath',
      annotation: 'Some volcanoes puff sulphur dioxide. This chart is that invisible breath, not a warning siren.',
      yCaption: 'How much volcanic gas the sensor is counting.',
      xCaption,
      accent: 'val',
      color: '#954990',
    }
  }
  return {
    title: ref.name.replace(/-/g, ' '),
    annotation: 'A live GeoNet measurement from this place — the same numbers scientists use.',
    yCaption: 'What this sensor is counting, in its scientific units.',
    xCaption,
    accent: 'puia',
    color: '#e83b00',
  }
}

function tildePoints(series: TildeSeries | null): { t: number; v: number }[] {
  if (!series?.data?.length) return []
  const raw = series.data
    .filter((d) => Number.isFinite(d.val))
    .map((d) => ({ t: new Date(d.ts).getTime(), v: d.val }))
  if (raw.length <= 720) return raw
  const slim = downsampleMinMax(
    raw.map((p) => p.v),
    raw.map((p) => p.t),
  )
  return slim.times.map((t, i) => ({ t, v: slim.values[i] }))
}

export function StationSheet({
  station,
  catalog,
  cameras,
  quakes,
  period,
  onPeriodChange,
  onClose,
}: {
  station: StationPoint
  catalog: Record<string, TildeSeriesRef[]>
  cameras: CameraFeature[]
  quakes: QuakeFeature[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
  onClose: () => void
}) {
  const live = useStationLive(station, catalog, cameras, quakes, period)
  const kind = primaryKind(station)
  const showWave =
    station.kinds.includes('seismic') &&
    !station.kinds.includes('dart') &&
    !station.kinds.includes('coastal')
  const wavePoints = live.waveform
    ? live.waveform.times.map((t, i) => ({ t, v: live.waveform!.values[i] }))
    : []
  const lastTilde = live.tilde.find((t) => t.series?.data?.length)?.series
  const periodLabel = CHART_PERIODS.find((p) => p.id === period)?.label ?? '24 hours'

  return (
    <div className="station-sheet" role="dialog" aria-modal="true" aria-labelledby="station-sheet-title">
      <header className="station-sheet-head">
        <button type="button" className="touch-btn primary sheet-back" onClick={onClose}>
          ← Sensors
        </button>
        <div className="station-sheet-titles">
          <p className="station-kicker">
            {stationSensorTypes(station).map((type) => (
              <span key={type} className="sensor-type-pill">
                <SensorTypeIcon type={type} size={16} />
                {type}
              </span>
            ))}
          </p>
          <h2 id="station-sheet-title">
            <span className="station-code">{station.code}</span>
            {station.name}
          </h2>
          <p className="station-blurb">{KIND_BLURB[kind]}</p>
          <PeriodPicker value={period} onChange={onPeriodChange} />
        </div>
        <div className="station-facts">
          <div>
            <strong>{station.lat.toFixed(2)}°</strong>
            <span>Latitude</span>
          </div>
          <div>
            <strong>{station.lon.toFixed(2)}°</strong>
            <span>Longitude</span>
          </div>
          <div>
            <strong>{Math.round(station.elevation)} m</strong>
            <span>Above sea</span>
          </div>
        </div>
      </header>

      <div className="station-sheet-body">
        <div className="station-charts">
          {showWave && (
            <AnnotatedChart
              title="The ground’s heartbeat"
              points={wavePoints}
              unit={live.waveform?.displayUnit ?? 'µm/s'}
              yCaption={
                live.waveform?.displayUnit === 'µm/s'
                  ? 'How fast the ground is moving up and down, in micrometres per second (smaller than a millimetre).'
                  : `Ground motion in ${live.waveform?.displayUnit ?? 'instrument counts'}.`
              }
              xCaption="This live wiggle is the last minute or two — not the 24 hour / 7 day / 30 day window."
              annotation={
                live.sensorName
                  ? `This wiggle is the ground shaking. Quiet earth = tiny line. A quake looks like a sudden bigger wiggle. Sensor: ${live.sensorName} (${live.waveform?.channel ?? 'vertical'}).`
                  : 'This wiggle is the ground shaking. Quiet earth = tiny line. A quake looks like a sudden bigger wiggle.'
              }
              updatedMs={live.waveform?.updatedMs}
              loading={live.loading && !live.waveform}
              empty={
                live.waveformError === 'no-channel'
                  ? 'This site is on the map, but it is not sending a shaking channel we can draw right now.'
                  : 'This sensor is having a quiet moment online — we could not load a live wiggle. The list and map still work; try Wellington WEL or another ground shaker.'
              }
              color="#e83b00"
              accent="puia"
            />
          )}

          {live.tilde.map(({ ref, series, error }) => {
            const copy = tildeCopy(ref, period)
            const points = tildePoints(series)
            const last = series?.data?.[series.data.length - 1]
            return (
              <AnnotatedChart
                key={`${ref.domain}-${ref.name}-${ref.aspect}`}
                title={copy.title}
                points={points}
                unit={series?.valueUnit ?? ''}
                yCaption={copy.yCaption}
                xCaption={copy.xCaption}
                annotation={copy.annotation}
                updatedMs={last ? new Date(last.ts).getTime() : undefined}
                loading={live.loading && !series && !error}
                empty="This extra chart is taking a nap. The sensor is real — the live numbers just did not arrive."
                color={copy.color}
                accent={copy.accent}
              />
            )
          })}

          {!showWave && live.tilde.length === 0 && !live.loading && (
            <div className="card anno-empty-block">
              We found this sensor on the map, but no live chart is attached yet. Nearby quakes and cameras still tell a story.
            </div>
          )}
        </div>

        <aside className="station-side">
          <section className="card station-side-card">
            <h3>Nearby volcano camera</h3>
            {live.cameras[0] ? (
              <CameraPeek cam={live.cameras[0]} />
            ) : (
              <p className="muted side-empty">
                No volcano camera nearby — that is OK. Not every sensor sits next to a crater.
              </p>
            )}
          </section>
          <section className="card station-side-card">
            <h3>Shakes nearby · {periodLabel}</h3>
            {live.quakes.length === 0 ? (
              <p className="muted side-empty">
                No earthquakes close to this sensor in the last {periodLabel.toLowerCase()}.
              </p>
            ) : (
              <ul className="sheet-quakes">
                {live.quakes.map((q) => (
                  <li key={q.properties.publicID}>
                    <span className="mag">{formatMag(q.properties.magnitude)}</span>
                    <div>
                      <strong>{q.properties.locality}</strong>
                      <p className="muted">
                        {formatRelativeTime(q.properties.time)} · {q.properties.depth.toFixed(0)} km deep
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {lastTilde && (
            <p className="muted sheet-note">
              Extra lines come from Tilde, GeoNet’s time-series library — not a website kids need to visit.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

function CameraPeek({ cam }: { cam: CameraFeature }) {
  return (
    <figure className="sheet-cam">
      <img
        src={cameraImageUrl(cam.properties['latest-image-medium'] || cam.properties['latest-image-thumb'])}
        alt={cam.properties.title}
      />
      <figcaption>
        <strong>{cam.properties.title}</strong>
        <span className="muted">{cam.properties['latest-timestamp']}</span>
      </figcaption>
    </figure>
  )
}
