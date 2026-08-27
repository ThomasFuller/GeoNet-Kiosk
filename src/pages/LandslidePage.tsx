import { brandIcon } from '../brand'
import { Methods, Note, PageHero, QuakeRow, StatChips, Steps } from '../components/science/ThemeKit'
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
    <div className="theme-page">
      <div className="theme-head">
        <PageHero
          title="Landslides"
          blurb="Slopes fail when gravity wins — after strong shaking, heavy rain, or when volcanic ground is weak. GeoNet does not run a nationwide live landslide map. It keeps a rapid-response science team, and instruments on selected slopes, dams and valleys."
          icon={brandIcon('landslide.svg')}
        />
        <StatChips
          items={[
            { value: gnss, label: 'GNSS pins live' },
            { value: seismic, label: 'Ground sensors' },
            { value: big.length, label: 'Recent M4+ quakes' },
          ]}
        />
      </div>

      <div className="pair-grid">
        <article className="card">
          <h2>Why a slope lets go</h2>
          <p className="muted">
            Earthquakes throw extra force into hillsides. Rain fills cracks and lifts pore water pressure. Volcanic
            ash and hydrothermally altered rock are already weak. Ice, rivers and people steepen the problem. Most
            days nothing moves; after a big trigger, many slopes can go at once.
          </p>
        </article>
        <article className="card">
          <h2>Rapid response science</h2>
          <p className="muted">
            GeoNet can put engineering geologists in the field within about 24 hours of a major event — deaths or
            injuries, a landslide dam that might burst, million-dollar damage, or a site with high research value.
            The job is public-safety advice plus a consistent scientific record.
          </p>
        </article>
      </div>

      <Steps
        title="How selected slopes are watched"
        steps={[
          {
            title: 'Pin the ground',
            body: 'GNSS stations — the same GPS-style pins used for volcanoes and slow-slip — can catch millimetre creep on a moving mass.',
          },
          {
            title: 'Watch the weather',
            body: 'Rain gauges and, at some sites, water-pressure sensors show when a slope is getting heavy and wet.',
          },
          {
            title: 'See the scarp',
            body: 'Cameras and field surveys record cracks, toe bulges and how a debris path changes after a storm or quake.',
          },
          {
            title: 'Feel the jolt',
            body: 'The national seismic network tells scientists which valleys just took a strong shake — a clue to where new slides may start.',
          },
        ]}
      />

      <Methods
        title="Places this science shows up"
        items={[
          {
            title: 'Dams and reservoirs',
            body: 'Some water-storage slopes are instrumented because a slide into a lake can make a wave of its own.',
          },
          {
            title: 'Fox Glacier valley',
            body: 'A long-running GeoNet monitoring project in a steep, wet, shaking landscape — a classroom for alpine landslides.',
          },
          {
            title: 'After a big quake',
            body: 'The catalogue on the Earthquakes page is also a landslide clue: shallow, strong shaking near steep country.',
          },
          {
            title: 'Open data',
            body: 'GNSS and environmental series sit on Tilde. Response reports and site stories live on GeoNet’s landslide pages.',
          },
        ]}
      />

      <section className="card list-panel">
        <h2 className="section-title">Larger recent quakes — possible slope triggers</h2>
        <p className="muted science-intro">
          Not every M4 starts a landslide. Depth, distance and how wet the hills already were all matter. These are the
          stronger events in the live catalogue.
        </p>
        <ul className="quake-list">
          {big.map((q) => (
            <QuakeRow key={q.properties.publicID} quake={q} />
          ))}
          {big.length === 0 && <p className="muted">No M4+ events in the current catalogue window.</p>}
        </ul>
      </section>

      <Note>
        Landslide warnings and road closures come from local authorities and Civil Defence, not this kiosk. If a slope
        above you is cracked, wet or recently shaken, treat it as unstable.
      </Note>
    </div>
  )
}
