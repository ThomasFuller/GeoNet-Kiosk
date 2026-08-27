import { brandIcon } from '../brand'
import { Methods, Note, PageHero, QuakeRow, StatChips, Steps, ThemeFrame } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function LandslidePage({ data }: { data: GeoNetBundle }) {
  const gnss = data.stations.filter((s) => s.kinds.includes('gnss')).length
  const seismic = data.stations.filter((s) => s.kinds.includes('seismic')).length
  const big = [...data.quakes]
    .filter((q) => q.properties.magnitude >= 4)
    .sort((a, b) => +new Date(b.properties.time) - +new Date(a.properties.time))
    .slice(0, 8)

  return (
    <ThemeFrame
      head={
        <>
          <PageHero
            title="Landslides"
            blurb="Slopes fail after strong shaking, heavy rain, or weak volcanic ground. GeoNet has no nationwide live landslide map — it runs rapid-response science and instruments on selected slopes."
            icon={brandIcon('landslide.svg')}
          />
          <StatChips
            items={[
              { value: gnss, label: 'GNSS pins live' },
              { value: seismic, label: 'Ground sensors' },
              { value: big.length, label: 'Recent M4+ quakes' },
            ]}
          />
        </>
      }
      main={
        <>
          <article className="card pair-block">
            <h2>Why a slope lets go</h2>
            <p className="muted">
              Earthquakes throw extra force into hillsides. Rain fills cracks and lifts pore pressure. Volcanic ash and
              altered rock are already weak. After a big trigger, many slopes can go at once.
            </p>
          </article>
          <article className="card pair-block">
            <h2>Rapid response science</h2>
            <p className="muted">
              Engineering geologists can be in the field within about 24 hours of a major event — injuries, a landslide
              dam, or high research value. The job is public-safety advice plus a consistent record.
            </p>
          </article>
          <section className="card list-panel">
            <h2 className="section-title">Larger recent quakes — possible slope triggers</h2>
            <ul className="quake-list">
              {big.map((q) => (
                <QuakeRow key={q.properties.publicID} quake={q} />
              ))}
              {big.length === 0 && <p className="muted">No M4+ events in the current catalogue window.</p>}
            </ul>
          </section>
        </>
      }
      aside={
        <>
          <Steps
            title="How selected slopes are watched"
            steps={[
              {
                title: 'Pin the ground',
                body: 'GNSS pins — the same GPS-style marks used for volcanoes — can catch millimetre creep.',
              },
              {
                title: 'Watch the weather',
                body: 'Rain gauges and water-pressure sensors show when a slope is getting heavy and wet.',
              },
              {
                title: 'See the scarp',
                body: 'Cameras and field surveys record cracks, toe bulges and debris paths after a storm or quake.',
              },
              {
                title: 'Feel the jolt',
                body: 'The seismic network flags which valleys just took a strong shake.',
              },
            ]}
          />
          <Methods
            title="Places this science shows up"
            items={[
              {
                title: 'Dams and reservoirs',
                body: 'A slide into a lake can make a wave of its own, so some water-storage slopes are instrumented.',
              },
              {
                title: 'Fox Glacier valley',
                body: 'A long-running GeoNet project in a steep, wet, shaking landscape.',
              },
            ]}
          />
          <Note>Landslide closures come from local authorities and Civil Defence, not this kiosk.</Note>
        </>
      }
    />
  )
}
