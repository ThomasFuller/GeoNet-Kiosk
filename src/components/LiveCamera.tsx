import { Link } from 'react-router-dom'
import { cameraImageUrl, type CameraFeature } from '../api/geonet'

export function LiveCamera({ cameras, bust }: { cameras: CameraFeature[]; bust: number }) {
  const cam =
    cameras.find((c) => /ruapehu from north/i.test(c.properties.title)) ??
    cameras.find((c) => /ruapehu/i.test(c.properties.title)) ??
    cameras[0]

  if (!cam) {
    return (
      <section className="card side-card">
        <h3 className="section-title">Volcano cameras</h3>
        <p className="muted">Loading volcano cameras…</p>
      </section>
    )
  }

  const src = cameraImageUrl(
    cam.properties['latest-image-medium'] || cam.properties['latest-image-thumb'],
    bust,
  )

  return (
    <section className="card side-card camera-card">
      <h3 className="section-title">
        <CameraIcon />
        Volcano cameras
      </h3>
      <div className="camera-frame">
        <img src={src} alt={cam.properties.title} />
        <div className="camera-live">
          <span className="live-dot" /> Latest
        </div>
      </div>
      <div className="camera-meta">
        <strong>{cam.properties.title}</strong>
        <p className="muted">{cam.properties['latest-timestamp']}</p>
      </div>
      <Link to="/cameras" className="link-arrow">
        View all cameras <img src="/brand/icons/right-arrow.svg" alt="" />
      </Link>
    </section>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="3" y="7" width="13" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10.5 21 8v8l-5-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
