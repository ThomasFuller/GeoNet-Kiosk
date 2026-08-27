import { volcanoDisplayName } from '../api/geonet'
import { brandIcon } from '../brand'
import { Note, PageHero, QuakeRow, StatChips, ThemeFrame } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function AlertsPage({ data }: { data: GeoNetBundle }) {
  const active = data.volcanoes.filter((v) => v.properties.level > 0)
  const big = [...data.quakes]
    .filter((q) => q.properties.magnitude >= 4)
    .sort((a, b) => +new Date(b.properties.time) - +new Date(a.properties.time))
  const dart = data.stations.filter((s) => s.kinds.includes('dart')).length
  const coastal = data.stations.filter((s) => s.kinds.includes('coastal')).length

  return (
    <ThemeFrame
      even
      head={
        <>
          <PageHero
            title="Today’s picture"
            blurb="Unrest and larger shakes from the live feeds, plus ocean sensors on duty. A science dashboard, not an alerting product."
            icon={brandIcon('alert.svg')}
          />
          <StatChips
            items={[
              { value: active.length, label: 'Volcanoes in unrest' },
              { value: big.length, label: 'M4+ in catalogue' },
              { value: dart, label: 'DART buoys' },
              { value: coastal, label: 'Sea gauges' },
            ]}
          />
        </>
      }
      main={
        <section className="card list-panel">
          <h3>Volcanoes with unrest</h3>
          {active.length === 0 ? (
            <p className="muted">All monitored volcanoes are at alert level 0 right now — typical background.</p>
          ) : (
            <ul className="quake-list">
              {active.map((v) => (
                <li key={v.properties.volcanoID}>
                  <span className={`val-badge val-${v.properties.level}`}>{v.properties.level}</span>
                  <div>
                    <strong>{volcanoDisplayName(v.properties.volcanoTitle)}</strong>
                    <p className="muted">{v.properties.activity}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      }
      aside={
        <>
          <section className="card list-panel">
            <h3>Larger quakes (M4+)</h3>
            <ul className="quake-list">
              {big.slice(0, 10).map((q) => (
                <QuakeRow key={q.properties.publicID} quake={q} />
              ))}
              {big.length === 0 && <p className="muted">No M4+ events in the current catalogue window.</p>}
            </ul>
          </section>
          <Note>
            Civil Defence / NEMA issue official warnings. A volcano at level 1 or a distant M4 is information, not an
            instruction to act.
          </Note>
        </>
      }
    />
  )
}
