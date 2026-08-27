import { volcanoDisplayName } from '../api/geonet'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, Scale, StatChips, Steps, ThemeFrame } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import { Link } from 'react-router-dom'
import './Pages.css'

const VAL = [
  { mark: '0', label: 'No unrest', hint: 'Typical background.', tone: '#e7deec' },
  { mark: '1', label: 'Minor unrest', hint: 'Small changes in quakes, gas, heat or ground.', tone: '#dcc9e0' },
  { mark: '2', label: 'Heightened', hint: 'Moderate to heightened unrest.', tone: '#d1b5d3' },
  { mark: '3', label: 'Minor eruption', hint: 'Eruption underway. Hazards near the vent.', tone: '#a867a2', ink: '#fff' },
  { mark: '4', label: 'Moderate eruption', hint: 'Wider ash and flow hazards.', tone: '#954990', ink: '#fff' },
  { mark: '5', label: 'Major eruption', hint: 'Significant nationwide effects.', tone: '#832c82', ink: '#fff' },
]

function accClass(acc: string): string {
  const v = acc.trim().toLowerCase()
  if (v.includes('green')) return 'green'
  if (v.includes('yellow')) return 'yellow'
  if (v.includes('orange')) return 'orange'
  if (v.includes('red')) return 'red'
  return 'unknown'
}

export function VolcanoesPage({ data }: { data: GeoNetBundle }) {
  const sorted = [...data.volcanoes].sort((a, b) => b.properties.level - a.properties.level)
  const unrest = sorted.filter((v) => v.properties.level > 0).length

  return (
    <ThemeFrame
      head={
        <>
          <PageHero
            title="Volcanoes"
            blurb="Cameras, gas, GNSS pins and seismometers set a Volcanic Alert Level from 0 to 5. The purple scale is GeoNet’s, not a traffic light."
            icon={brandIcon('volcano.svg')}
          />
          <StatChips
            items={[
              { value: sorted.length, label: 'Monitored volcanoes' },
              { value: unrest, label: 'In unrest now' },
              { value: data.cameras.length, label: 'Live cameras' },
            ]}
          />
        </>
      }
      main={
        <div className="tile-board volcano-board">
          {sorted.map((v) => (
            <article key={v.properties.volcanoID} className="card volcano-tile">
              <span className={`val-badge val-${v.properties.level}`}>{v.properties.level}</span>
              <div>
                <h3>{volcanoDisplayName(v.properties.volcanoTitle)}</h3>
                <p className="muted">{v.properties.activity}</p>
                {v.properties.hazards && <p className="muted">{v.properties.hazards}</p>}
                <p className="acc-pill">
                  <span className={`acc-dot ${accClass(v.properties.acc)}`} />
                  Aviation colour: {v.properties.acc || '—'}
                </p>
              </div>
            </article>
          ))}
        </div>
      }
      aside={
        <>
          <Link to="/cameras" className="link-arrow card">
            Watch the volcano cameras <img src={brandIcon('right-arrow.svg')} alt="" />
          </Link>
          <Scale
            title="Volcanic Alert Levels"
            intro="Six levels describe current state — not a countdown to an eruption."
            items={VAL}
          />
          <Steps
            title="Four ways to take a pulse"
            steps={[
              {
                title: 'See',
                body: 'Webcams send a still every 10 minutes. A one-second archive sits on the camera if scientists need a short movie.',
              },
              {
                title: 'Smell',
                body: 'Magma leaks CO₂, SO₂ and H₂S. Aircraft fly the plume; scanDOAS and MultiGas watch from the ground.',
              },
              {
                title: 'Measure shape',
                body: 'GNSS pins pick millimetre shifts. Satellites (InSAR) and Lake Taupō levelling watch the bigger bulge.',
              },
              {
                title: 'Listen',
                body: 'Seismometers catch tremor. Infrasound microphones hear the air-thump of an explosive burst.',
              },
            ]}
          />
          <Methods
            title="Extra instruments"
            items={[
              {
                title: 'Envirosensors',
                body: 'Temperature and water level in crater lakes and fumaroles every 10 minutes.',
              },
              {
                title: 'Aviation colours',
                body: 'Green to red — a separate ash-to-aircraft code so planes can route around a plume.',
              },
            ]}
          />
          <Note>Alert levels are scientific status, not an evacuation order. Civil Defence decides public action.</Note>
        </>
      }
    />
  )
}
