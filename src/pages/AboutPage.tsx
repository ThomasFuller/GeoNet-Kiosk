import { Link } from 'react-router-dom'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, Steps, ThemeFrame } from '../components/science/ThemeKit'
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
    <ThemeFrame
      head={
        <PageHero
          title={teReo ? 'Mō GeoNet' : 'How GeoNet works'}
          blurb="GeoNet is Aotearoa New Zealand’s geological hazard monitoring system — Natural Hazards Commission Toka Tū Ake and Earth Sciences New Zealand. This kiosk drinks from the same open data the scientists use."
          icon={brandIcon('info.svg')}
        />
      }
      main={
        <div className="hazard-links about-hazards">
          {hazards.map((h) => (
            <Link key={h.to} to={h.to} className="card hazard-link">
              <img src={h.icon} alt="" />
              <h3>{h.title}</h3>
              <p className="muted">{h.body}</p>
            </Link>
          ))}
        </div>
      }
      aside={
        <>
          <Steps
            title="Listen, understand, share"
            steps={[
              {
                title: 'Listen',
                body: 'Currently operating sensors stream shakes, sea level, gas, magnets, GNSS and cameras into data centres every second.',
              },
              {
                title: 'Understand',
                body: 'Automatic processes draft a location. Analysts at the National Geohazards Monitoring Centre refine the bigger events.',
              },
              {
                title: 'Share',
                body: 'Quake origins, VAL, Tilde series, FDSN waveforms and camera images are open — the same well this kiosk taps.',
              },
              {
                title: 'Learn here',
                body: 'A 1920×1080 touch display: live maps first, then how the measurement is made.',
              },
            ]}
          />
          <Methods
            title="What this kiosk is — and is not"
            items={[
              {
                title: 'Live science',
                body: 'Feeds refresh from api.geonet.org.nz, Tilde and the sensor-search inventory of stations operating today.',
              },
              {
                title: 'Not a siren',
                body: 'Official warnings belong to Civil Defence / NEMA. If the ground shakes long or strong, do not wait for a kiosk.',
              },
            ]}
          />
          <Note>Brand follows beta.geonet.org.nz. Not an official emergency alerting product.</Note>
        </>
      }
    />
  )
}
