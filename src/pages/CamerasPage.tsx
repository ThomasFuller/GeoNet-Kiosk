import { cameraImageUrl, type CameraFeature } from '../api/geonet'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, StatChips, ThemeFrame } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

export function CamerasPage({ data }: { data: GeoNetBundle }) {
  const volcanoes = new Set(data.cameras.map((cam) => cam['volcano-title']?.[0] || 'Other')).size

  return (
    <ThemeFrame
      head={
        <>
          <PageHero
            title="Volcano cameras"
            blurb="Remote stills about every ten minutes. Scientists watch steam, snow, crater lakes and ash without standing on the mountain."
            icon={brandIcon('camera.svg')}
          />
          <StatChips
            items={[
              { value: data.cameras.length, label: 'Cameras in this feed' },
              { value: volcanoes, label: 'Volcano views' },
            ]}
          />
        </>
      }
      main={
        <div className="camera-grid">
          {data.cameras.map((cam, i) => (
            <CameraCard key={`${cam.id}-${cam.properties.title}-${i}`} cam={cam} bust={data.updatedAt} />
          ))}
        </div>
      }
      aside={
        <>
          <Methods
            title="How the pictures are made"
            items={[
              {
                title: 'Ten-minute stills',
                body: 'Each camera sends a fixed-view frame to the data centre. Those stills are what you see here.',
              },
              {
                title: 'One-second archive',
                body: 'A one-second sequence sits on the camera card. During unrest, scientists can pull a short movie.',
              },
              {
                title: 'Day and night glass',
                body: 'Daylight and low-light lenses. A bright moon can be enough. Cloud still wins.',
              },
              {
                title: 'Why it matters',
                body: 'Steam, lake colour and ash on ice sit beside gas, GNSS and tremor.',
              },
            ]}
          />
          <Note>Camera JPEGs come from images.geonet.org.nz. They are observations, not an all-clear.</Note>
        </>
      }
    />
  )
}

function CameraCard({ cam, bust }: { cam: CameraFeature; bust: number }) {
  const volcano = cam['volcano-title']?.[0]
  return (
    <article className="card camera-tile">
      <img
        src={cameraImageUrl(cam.properties['latest-image-medium'] || cam.properties['latest-image-thumb'], bust)}
        alt={cam.properties.title}
      />
      <div>
        <strong>{cam.properties.title}</strong>
        <p className="muted">
          {volcano ? `${volcano} · ` : ''}
          {cam.properties['latest-timestamp']}
        </p>
      </div>
    </article>
  )
}
