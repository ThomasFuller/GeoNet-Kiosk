import { Link } from 'react-router-dom'
import { volcanoDisplayName, type VolcanoFeature } from '../api/geonet'
import { brandIcon } from '../brand'

function valClass(level: number) {
  return `val-badge val-${Math.min(5, Math.max(0, level))}`
}

export function VolcanoAlerts({ volcanoes }: { volcanoes: VolcanoFeature[] }) {
  const list = [...volcanoes]
    .sort((a, b) => b.properties.level - a.properties.level)
    .filter((v) => v.properties.level > 0)
    .slice(0, 2)

  return (
    <section className="card side-card">
      <h3 className="section-title">
        <img src={brandIcon('volcano.svg')} alt="" />
        Volcanic alert levels
      </h3>
      <ul className="volcano-list">
        {(list.length ? list : volcanoes.slice(0, 2)).map((v) => (
          <li key={v.properties.volcanoID}>
            <span className={valClass(v.properties.level)}>{v.properties.level}</span>
            <div>
              <strong>{volcanoDisplayName(v.properties.volcanoTitle)}</strong>
              <p className="muted">{v.properties.activity || 'No volcanic unrest.'}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/volcanoes" className="link-arrow">
        View all volcanoes <img src={brandIcon('right-arrow.svg')} alt="" />
      </Link>
    </section>
  )
}
