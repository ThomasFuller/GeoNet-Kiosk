import { brandIcon } from '../brand'
import { QuakeMap } from '../components/QuakeMap'
import { Methods, Note, PageHero, StatChips, Steps, ThemeFrame } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function TsunamiPage({ data }: { data: GeoNetBundle }) {
  const ocean = data.stations.filter((s) => s.kinds.includes('dart') || s.kinds.includes('coastal'))
  const dart = ocean.filter((s) => s.kinds.includes('dart'))
  const coastal = ocean.filter((s) => s.kinds.includes('coastal'))
  const listed = [...ocean].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ThemeFrame
      head={
        <>
          <PageHero
            title="Tsunami"
            blurb="GeoNet does not issue tsunami warnings. It collects earthquake and sea-level evidence — DART buoys in deep water, and gauges around the coast — that NEMA and Pacific partners use."
            icon={brandIcon('tsunami.svg')}
          />
          <StatChips
            items={[
              { value: dart.length, label: 'DART buoys' },
              { value: coastal.length, label: 'Coastal gauges' },
              { value: ocean.length, label: 'Ocean sensors live' },
            ]}
          />
        </>
      }
      main={
        <div className="map-page-frame card">
          <QuakeMap
            quakes={[]}
            stations={ocean}
            showStations
            showAllStations
            showFullLink={false}
            legend="stations"
          />
        </div>
      }
      aside={
        <>
          <div className="card list-panel">
            <h2 className="section-title">Currently operating sea sensors</h2>
            <ul className="quake-list station-mini">
              {listed.map((s) => (
                <li key={s.code}>
                  <span className={`kind-dot kind-${s.kinds.includes('dart') ? 'dart' : 'coastal'}`} />
                  <div>
                    <strong>
                      {s.code} · {s.name}
                    </strong>
                    <p className="muted">
                      {s.kinds.includes('dart') ? 'DART bottom pressure' : 'Coastal sea-level gauge'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Steps
            title="From seafloor to a sea-level trace"
            steps={[
              {
                title: 'The quake',
                body: 'Long-period seismometers flag offshore earthquakes that may have shoved the seafloor.',
              },
              {
                title: 'Deep ocean',
                body: 'A DART feels the extra water weight of a tsunami as a pressure bump — before the wave reaches land.',
              },
              {
                title: 'The coast',
                body: 'Gauges record the actual sea. Tides dominate; a tsunami is a longer extra wiggle.',
              },
              {
                title: 'People decide',
                body: 'NEMA issues official New Zealand notifications, with GNS Science advice.',
              },
            ]}
          />
          <Methods
            title="What this network cannot do"
            items={[
              {
                title: 'Local tsunami',
                body: 'A wave born just offshore can reach the beach before a siren. Long or strong coastal shaking is the natural warning.',
              },
              {
                title: 'DART heartbeats',
                body: 'Quiet: a height every 15 minutes. Event mode: 15-second samples for up to three hours.',
              },
            ]}
          />
          <Note>Official tsunami notifications come from Civil Defence / NEMA, not GeoNet and not this kiosk.</Note>
        </>
      }
    />
  )
}
