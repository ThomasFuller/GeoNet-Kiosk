import { volcanoDisplayName } from '../api/geonet'
import { brandIcon } from '../brand'
import { Methods, Note, PageHero, Scale, StatChips, Steps } from '../components/science/ThemeKit'
import type { GeoNetBundle } from '../hooks/useGeoNetData'
import { Link } from 'react-router-dom'
import './Pages.css'

const VAL = [
  { mark: '0', label: 'No unrest', hint: 'Typical background. Magma is quiet.', tone: '#e7deec' },
  { mark: '1', label: 'Minor unrest', hint: 'Small changes in earthquakes, gas, heat or ground.', tone: '#dcc9e0' },
  { mark: '2', label: 'Heightened', hint: 'Moderate to heightened unrest. Watch more closely.', tone: '#d1b5d3' },
  { mark: '3', label: 'Minor eruption', hint: 'An eruption is underway. Hazards near the vent.', tone: '#a867a2', ink: '#fff' },
  { mark: '4', label: 'Moderate eruption', hint: 'Larger eruption. Wider ash and flow hazards.', tone: '#954990', ink: '#fff' },
  { mark: '5', label: 'Major eruption', hint: 'Major eruption with significant nationwide effects.', tone: '#832c82', ink: '#fff' },
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
    <div className="theme-page">
      <div className="theme-head">
        <PageHero
          title="Volcanoes"
          blurb="GeoNet takes the pulse of Aotearoa’s volcanoes with cameras, gas, GNSS pins, lakes and seismometers — then publishes a Volcanic Alert Level from 0 to 5. The purple scale is GeoNet’s, not a traffic light."
          icon={brandIcon('volcano.svg')}
        />
        <StatChips
          items={[
            { value: sorted.length, label: 'Monitored volcanoes' },
            { value: unrest, label: 'In unrest now' },
            { value: data.cameras.length, label: 'Live cameras' },
          ]}
        />
      </div>

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

      <Link to="/cameras" className="link-arrow card">
        Watch the volcano cameras <img src={brandIcon('right-arrow.svg')} alt="" />
      </Link>

      <Scale
        title="Volcanic Alert Levels"
        intro="The New Zealand system has six levels. It describes the volcano’s current state for residents, iwi, pilots, lifelines and scientists — not a countdown to an eruption."
        items={VAL}
      />

      <Steps
        title="Four ways to take a volcano’s pulse"
        steps={[
          {
            title: 'See',
            body: 'Webcams shoot a still every 10 minutes, day and night when there is light. A one-second archive sits on the camera if scientists need a short movie of an eruption.',
          },
          {
            title: 'Smell',
            body: 'Magma leaks CO₂, SO₂ and H₂S. Aircraft fly the plume; scanDOAS and MultiGas stations watch from the ground when the wind is right.',
          },
          {
            title: 'Measure shape',
            body: 'GNSS pins pick millimetre shifts as magma or hot water moves. Satellites (InSAR) and Lake Taupō levelling watch the bigger bulge.',
          },
          {
            title: 'Listen',
            body: 'Seismometers catch volcano-tectonic quakes and tremor. Infrasound microphones hear the air-thump of an explosive burst.',
          },
        ]}
      />

      <Methods
        title="What the extra instruments add"
        items={[
          {
            title: 'Envirosensors',
            body: 'Temperature and water level in crater lakes, fumaroles and hot springs — every 10 minutes, including Green Lake on Raoul Island.',
          },
          {
            title: 'RSAM & SSAM',
            body: 'Average tremor size, and which frequencies are ringing. A neat way to see volcanic tremor that is messy on a raw drum.',
          },
          {
            title: 'Aviation colours',
            body: 'Green, yellow, orange, red — a separate ash-to-aircraft code so planes can route around a plume.',
          },
          {
            title: 'Open series',
            body: 'Gas, GNSS and lake data live on Tilde. Seismic and acoustic waveforms go out through FDSN.',
          },
        ]}
      />

      <Note>
        Alert levels are scientific status, not an evacuation order. Civil Defence and local controllers decide public
        action. This kiosk is not a warning product.
      </Note>
    </div>
  )
}
