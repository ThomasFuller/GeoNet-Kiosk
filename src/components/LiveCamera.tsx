import { Link } from 'react-router-dom'
import { cameraImageUrl, type CameraFeature } from '../api/geonet'
import { brandIcon } from '../brand'

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
    cam.properties['latest-image-large'] ||
      cam.properties['latest-image-medium'] ||
      cam.properties['latest-image-thumb'],
    bust,
  )

  return (
    <section className="card side-card camera-card">
      <h3 className="section-title">
        <img src={brandIcon('camera.svg')} alt="" />
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
        View all cameras <img src={brandIcon('right-arrow.svg')} alt="" />
      </Link>
    </section>
  )
}
