import { useEffect, useState, type ReactNode } from 'react'
import { KIOSK_HEIGHT, KIOSK_WIDTH } from '../api/geonet'
import { brandIcon } from '../brand'

export function KioskStage({ children }: { children: ReactNode }) {
  const [transform, setTransform] = useState('scale(1)')

  useEffect(() => {
    const fit = () => {
      const scale = Math.min(window.innerWidth / KIOSK_WIDTH, window.innerHeight / KIOSK_HEIGHT)
      const x = (window.innerWidth - KIOSK_WIDTH * scale) / 2
      const y = (window.innerHeight - KIOSK_HEIGHT * scale) / 2
      setTransform(`translate(${x}px, ${y}px) scale(${scale})`)
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
    }
  }, [])

  return (
    <div className="kiosk-letterbox">
      <div className="kiosk-stage" style={{ transform }}>
        <div
          className="kiosk-pattern"
          aria-hidden="true"
          style={{ backgroundImage: `url("${brandIcon('pattern-altogether.svg')}")` }}
        />
        {children}
      </div>
    </div>
  )
}
