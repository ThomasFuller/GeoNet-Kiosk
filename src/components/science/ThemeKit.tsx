import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { formatMag, formatRelativeTime, intensityWord, type QuakeFeature } from '../../api/geonet'
import './ThemeKit.css'

export function PageHero({
  title,
  blurb,
  icon,
}: {
  title: string
  blurb: string
  icon: string
}) {
  return (
    <div className="page-hero card">
      <Link to="/" className="link-arrow back">
        ← Home
      </Link>
      <h1>
        <img src={icon} alt="" />
        {title}
      </h1>
      <p className="muted">{blurb}</p>
    </div>
  )
}

export function StatChips({
  items,
}: {
  items: Array<{ value: string | number; label: string }>
}) {
  return (
    <div className={`stat-row theme-stats card cols-${Math.min(items.length, 4)}`}>
      {items.map((item) => (
        <div key={item.label} className="stat">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Steps({
  title,
  steps,
}: {
  title: string
  steps: Array<{ title: string; body: string }>
}) {
  return (
    <section className="card science-band">
      <h2>{title}</h2>
      <ol className="science-steps">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="step-n">{i + 1}</span>
            <h3>{step.title}</h3>
            <p className="muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Methods({
  title,
  items,
}: {
  title: string
  items: Array<{ title: string; body: string }>
}) {
  return (
    <section className="card science-band">
      <h2>{title}</h2>
      <div className={`method-grid cols-${Math.min(items.length, 4)}`}>
        {items.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p className="muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Scale({
  title,
  intro,
  items,
}: {
  title: string
  intro?: string
  items: Array<{ mark: string; label: string; hint: string; tone?: string; ink?: string }>
}) {
  return (
    <section className="card science-band">
      <h2>{title}</h2>
      {intro && <p className="muted science-intro">{intro}</p>}
      <div className="science-scale" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <div key={item.mark} className="scale-cell">
            <span
              className="scale-swatch"
              style={{ background: item.tone ?? 'var(--whenua-05)', color: item.ink ?? 'var(--puia-100)' }}
            >
              {item.mark}
            </span>
            <strong>{item.label}</strong>
            <p className="muted">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="muted kiosk-note card">{children}</p>
}

export function QuakeRow({ quake }: { quake: QuakeFeature }) {
  return (
    <li>
      <span className="mag">{formatMag(quake.properties.magnitude)}</span>
      <div>
        <strong>{quake.properties.locality}</strong>
        <p className="muted">
          {formatRelativeTime(quake.properties.time)} · {quake.properties.depth.toFixed(0)} km deep
          {Number.isFinite(quake.properties.mmi)
            ? ` · ${intensityWord(quake.properties.mmi)} shaking`
            : ''}
        </p>
      </div>
    </li>
  )
}
