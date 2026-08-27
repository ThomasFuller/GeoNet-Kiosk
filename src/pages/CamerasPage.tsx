import { cameraImageUrl, type CameraFeature } from '../api/geonet'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, StatChips } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import './Pages.css'

function groupCameras(cameras: CameraFeature[]): Array<{ volcano: string; cams: CameraFeature[] }> {
  const map = new Map<string, CameraFeature[]>()
  for (const cam of cameras) {
    const volcano = cam['volcano-title']?.[0] || 'Other views'
    const list = map.get(volcano) ?? []
    list.push(cam)
    map.set(volcano, list)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([volcano, cams]) => ({ volcano, cams }))
}

export function CamerasPage({ data }: { data: GeoNetBundle }) {
  const groups = groupCameras(data.cameras)

  return (
    <div className="theme-page">
      <div className="theme-head">
        <PageHero
          title="Volcano cameras"
          blurb="Remote stills, about every ten minutes, so scientists can watch steam, snow, crater lakes and ash without standing on the mountain. Many sites are solar-powered in Tongariro National Park and other wild places."
          icon={brandIcon('camera.svg')}
        />
        <StatChips
          items={[
            { value: data.cameras.length, label: 'Cameras in this feed' },
            { value: groups.length, label: 'Volcano views' },
          ]}
        />
      </div>

      <Methods
        title="How the pictures are made"
        items={[
          {
            title: 'Ten-minute stills',
            body: 'Each camera sends a frame to the data centre on a fixed view. Those stills are what you see here, cache-busted so the kiosk stays current.',
          },
          {
            title: 'One-second archive',
            body: 'The camera also keeps a one-second sequence on its memory card. During unrest, scientists can pull a short movie without sitting on the rim.',
          },
          {
            title: 'Day and night glass',
            body: 'Daylight and low-light lenses. A bright moon can be enough. Cloud, of course, still wins — weather is part of the data.',
          },
          {
            title: 'Why it matters',
            body: 'Steam plumes, lake colour, fresh snow-free rock and ash on the ice are visual clues that sit beside gas, GNSS and tremor.',
          },
        ]}
      />

      <div className="camera-groups">
        {groups.map((group) => (
          <section key={group.volcano}>
            <h2 className="section-title">{group.volcano}</h2>
            <div className="camera-grid">
              {group.cams.map((cam, i) => (
                <CameraCard key={`${cam.id}-${cam.properties.title}-${i}`} cam={cam} bust={data.updatedAt} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Note>Camera JPEGs come from images.geonet.org.nz. They are observations, not an all-clear.</Note>
    </div>
  )
}

function CameraCard({ cam, bust }: { cam: CameraFeature; bust: number }) {
  return (
    <article className="card camera-tile">
      <img
        src={cameraImageUrl(cam.properties['latest-image-medium'] || cam.properties['latest-image-thumb'], bust)}
        alt={cam.properties.title}
      />
      <div>
        <strong>{cam.properties.title}</strong>
        <p className="muted">{cam.properties['latest-timestamp']}</p>
      </div>
    </article>
  )
}
