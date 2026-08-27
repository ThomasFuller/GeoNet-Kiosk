import { NavLink } from 'react-router-dom'
import { brandIcon } from '../brand'
import './Header.css'

const nav = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/alerts', label: 'Alerts', icon: 'alert' },
  { to: '/about', label: 'About', icon: 'info' },
] as const

function NavIcon({ name }: { name: (typeof nav)[number]['icon'] }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (name === 'map') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 4 3 6.5V19l6-2.5 6 2.5 6-2.5V4.5L15 7 9 4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 4v12.5M15 7v12.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }
  if (name === 'alert') {
    return <img src={brandIcon('alert.svg')} alt="" />
  }
  return <img src={brandIcon('info.svg')} alt="" />
}

export function Header({ teReo, onToggleTeReo }: { teReo: boolean; onToggleTeReo: () => void }) {
  return (
    <header className="kiosk-header">
      <NavLink to="/" className="brand" aria-label="GeoNet home">
        <img src={brandIcon('geonet.svg')} alt="GeoNet" className="brand-logo" />
        <span className="brand-sub">Aotearoa New Zealand</span>
      </NavLink>

      <nav className="kiosk-nav" aria-label="Primary">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">
              <NavIcon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`nav-item lang-toggle${teReo ? ' active' : ''}`}
          onClick={onToggleTeReo}
          aria-pressed={teReo}
          title="Toggle te reo Māori labels"
        >
          <span className="nav-icon koru" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 20c-4.4 0-8-3.2-8-7.2C4 8 7.2 4.8 12 4.8c3.4 0 5.8 1.7 5.8 4.2 0 2-1.6 3.4-3.8 3.4-1.7 0-3-1-3-2.4 0-1 .7-1.8 1.8-1.8.8 0 1.3.4 1.3 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Māori</span>
        </button>
      </nav>
    </header>
  )
}
