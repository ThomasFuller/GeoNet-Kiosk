import { Link } from 'react-router-dom'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, Steps } from '../components/science/ThemeKit'
import './Pages.css'

const hazards = [
  {
    to: '/earthquakes',
    icon: brandIcon('earthquake.svg'),
    title: 'Earthquakes',
    body: 'Seismometers, strong motion and felt reports build the live catalogue.',
  },
  {
    to: '/volcanoes',
    icon: brandIcon('volcano.svg'),
    title: 'Volcanoes',
    body: 'Cameras, gas, GNSS and tremor set Volcanic Alert Levels 0–5.',
  },
  {
    to: '/tsunami',
    icon: brandIcon('tsunami.svg'),
    title: 'Tsunami',
    body: 'DART buoys and coastal gauges watch the sea after a seafloor quake.',
  },
  {
    to: '/landslide',
    icon: brandIcon('landslide.svg'),
    title: 'Landslides',
    body: 'Rapid-response mapping plus GNSS and cameras on selected slopes.',
  },
] as const

export function AboutPage({ teReo }: { teReo: boolean }) {
  return (
    <div className="theme-page">
      <PageHero
        title={teReo ? 'Mō GeoNet' : 'How GeoNet works'}
        blurb="GeoNet is Aotearoa New Zealand’s geological hazard monitoring system — a collaboration between Natural Hazards Commission Toka Tū Ake and Earth Sciences New Zealand. This kiosk drinks from the same open data the scientists use."
        icon={brandIcon('info.svg')}
      />

      <div className="hazard-links">
        {hazards.map((h) => (
          <Link key={h.to} to={h.to} className="card hazard-link">
            <img src={h.icon} alt="" />
            <h3>{h.title}</h3>
            <p className="muted">{h.body}</p>
          </Link>
        ))}
      </div>

      <Steps
        title="Listen, understand, share"
        steps={[
          {
            title: 'Listen',
            body: 'Hundreds of currently operating sensors stream shakes, sea level, gas, magnets, GNSS pins and camera stills into data centres — and the cloud — every second of the day.',
          },
          {
            title: 'Understand',
            body: 'Automatic processes draft a location and magnitude. Analysts at the National Geohazards Monitoring Centre refine the bigger events. Volcanologists cross-check four kinds of volcano data before an alert level moves.',
          },
          {
            title: 'Share',
            body: 'Quake origins, VAL, Tilde series, FDSN waveforms and camera images are open. Apps, universities, emergency partners and this floor kiosk all tap the same well.',
          },
          {
            title: 'Learn here',
            body: 'The screens are built for a 1920×1080 touch display: live maps first, then how the measurement is made. Curiosity is the point.',
          },
        ]}
      />

      <Methods
        title="What this kiosk is — and is not"
        items={[
          {
            title: 'Live science',
            body: 'Counts, maps and alert levels refresh from api.geonet.org.nz, Tilde and the sensor-search inventory of stations operating today.',
          },
          {
            title: 'Open by design',
            body: 'GeoNet data is free to use under a Creative Commons licence. The look follows beta.geonet.org.nz — Whenua, Puia and the volcanic purple scale.',
          },
          {
            title: 'Not a siren',
            body: 'Official warnings belong to Civil Defence / NEMA. If the ground shakes long or strong, do not wait for a kiosk.',
          },
        ]}
      />

      <Note>
        Brand, type and icons follow beta.geonet.org.nz. Not an official emergency alerting product — always follow
        Civil Defence advice.
      </Note>
    </div>
  )
}
