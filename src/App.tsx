import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Header } from './components/Header'
import { StatusBar } from './components/HomeExtras'
import { KioskStage } from './components/KioskStage'
import { FeltModal } from './components/FeltModal'
import { useGeoNetData } from './hooks/useGeoNetData'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { AlertsPage } from './pages/AlertsPage'
import { CamerasPage } from './pages/CamerasPage'
import { EarthquakesPage } from './pages/EarthquakesPage'
import { LandslidePage } from './pages/LandslidePage'
import { MapPage, SensorsPage } from './pages/SectionPages'
import { TsunamiPage } from './pages/TsunamiPage'
import { VolcanoesPage } from './pages/VolcanoesPage'
import './styles/tokens.css'

const IDLE_HOME_MS = 3 * 60_000

export default function App() {
  const data = useGeoNetData()
  const [teReo, setTeReo] = useState(false)
  const [feltOpen, setFeltOpen] = useState(false)
  const [clock, setClock] = useState(formatClock())
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let timer = 0
    const bump = () => {
      window.clearTimeout(timer)
      if (isHome && !feltOpen) return
      timer = window.setTimeout(() => {
        setFeltOpen(false)
        navigate('/')
      }, IDLE_HOME_MS)
    }
    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    bump()
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, bump))
    }
  }, [isHome, feltOpen, navigate])

  return (
    <KioskStage>
      <div className="app-shell">
        <Header teReo={teReo} onToggleTeReo={() => setTeReo((v) => !v)} />
        <main className={`kiosk-scroll${isHome ? '' : ' allow-scroll'}`}>
          {data.error && (
            <div className="error-state card">
              Couldn’t refresh some GeoNet feeds: {data.error}
              <button type="button" className="touch-btn primary" onClick={data.refresh}>
                Retry
              </button>
            </div>
          )}
          <Routes>
            <Route
              path="/"
              element={<HomePage data={data} teReo={teReo} onReport={() => setFeltOpen(true)} />}
            />
            <Route path="/map" element={<MapPage data={data} />} />
            <Route path="/earthquakes" element={<EarthquakesPage data={data} />} />
            <Route path="/volcanoes" element={<VolcanoesPage data={data} />} />
            <Route path="/cameras" element={<CamerasPage data={data} />} />
            <Route path="/sensors" element={<SensorsPage data={data} />} />
            <Route path="/tsunami" element={<TsunamiPage data={data} />} />
            <Route path="/landslide" element={<LandslidePage data={data} />} />
            <Route path="/alerts" element={<AlertsPage data={data} />} />
            <Route path="/about" element={<AboutPage teReo={teReo} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <StatusBar updatedAt={data.updatedAt} loading={data.loading} clock={clock} />
        <FeltModal open={feltOpen} onClose={() => setFeltOpen(false)} />
      </div>
    </KioskStage>
  )
}

function formatClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
