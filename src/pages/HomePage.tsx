import { QuakeMap } from '../components/QuakeMap'
import { QuakeSummary } from '../components/QuakeSummary'
import { VolcanoAlerts } from '../components/VolcanoAlerts'
import { LiveCamera } from '../components/LiveCamera'
import { CategoryGrid, FeltItBanner, Hero } from '../components/HomeExtras'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './HomePage.css'

export function HomePage({
  data,
  teReo,
  onReport,
}: {
  data: GeoNetBundle
  teReo: boolean
  onReport: () => void
}) {
  const latest = [...data.quakes].sort(
    (a, b) => +new Date(b.properties.time) - +new Date(a.properties.time),
  )[0]
  const unrest = data.volcanoes.filter((v) => v.properties.level > 0).length

  return (
    <div className="page home-page">
      <div className="home-grid">
        <div className="home-main">
          <Hero
            teReo={teReo}
            stats={data.stats}
            sensorCount={data.stations.length}
            unrestCount={unrest}
            news={data.news[0]}
          />
          <FeltItBanner teReo={teReo} onReport={onReport} />
          <QuakeMap quakes={data.quakes} stations={data.stations} compact />
        </div>
        <aside className="home-side">
          <QuakeSummary stats={data.stats} feltReports={data.feltReports} latest={latest} />
          <VolcanoAlerts volcanoes={data.volcanoes} />
          <LiveCamera cameras={data.cameras} bust={data.updatedAt} />
        </aside>
      </div>
      <CategoryGrid teReo={teReo} />
    </div>
  )
}
