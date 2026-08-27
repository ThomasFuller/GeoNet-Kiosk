import type { SensorTypeName } from '../api/geonet'
import './SensorTypeIcon.css'

type Shape = 'circle' | 'square' | 'triangle' | 'inverted' | 'diamond' | 'star'

type Style = {
  shape: Shape
  fill: string
  stroke?: string
}

/** Colours and shapes from GeoNet’s sensor search map. */
export const SENSOR_TYPE_STYLE: Record<SensorTypeName, Style> = {
  'Air pressure sensor': { shape: 'diamond', fill: '#FFD800' },
  'Broadband seismometer': { shape: 'circle', fill: '#FF0000' },
  'Coastal sea level gauge': { shape: 'inverted', fill: '#000080' },
  'DART bottom pressure recorder': { shape: 'inverted', fill: '#FF0090' },
  'DOAS spectrometer': { shape: 'triangle', fill: '#005869' },
  'Environmental sensor': { shape: 'diamond', fill: '#006600' },
  'Geomagnetic sensor': { shape: 'star', fill: '#FFAE00', stroke: '#B06A00' },
  'GNSS/GPS': { shape: 'triangle', fill: '#00CCCC' },
  'Lake level gauge': { shape: 'inverted', fill: '#000080' },
  'Short period seismometer': { shape: 'circle', fill: '#FFC0CB' },
  'Strong motion sensor': { shape: 'square', fill: '#006600' },
}

export const SENSOR_TYPE_BLURB: Record<SensorTypeName, string> = {
  'Air pressure sensor': 'Weight of the air',
  'Broadband seismometer': 'Shakes of every size',
  'Coastal sea level gauge': 'Sea height at the shore',
  'DART bottom pressure recorder': 'Tsunami sensor in deep ocean',
  'DOAS spectrometer': 'Volcanic gas on the wind',
  'Environmental sensor': 'Heat, gas or ground at a volcano',
  'Geomagnetic sensor': 'Earth’s magnetic field',
  'GNSS/GPS': 'Whether the land is creeping',
  'Lake level gauge': 'Height of a volcanic lake',
  'Short period seismometer': 'Nearby, sharp shakes',
  'Strong motion sensor': 'Big shakes near people',
}

export function sensorTypeSvg(type: SensorTypeName, size = 22): string {
  const { shape, fill, stroke = '#000' } = SENSOR_TYPE_STYLE[type]
  const open = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"`
  switch (shape) {
    case 'circle':
      return `<svg ${open} viewBox="0 0 17 17"><circle cx="8.5" cy="8.5" r="7.5"/></svg>`
    case 'square':
      return `<svg ${open} viewBox="0 0 6 6"><rect x="0" y="0" width="6" height="6"/></svg>`
    case 'triangle':
      return `<svg ${open} viewBox="0 0 14 14"><path d="M7 0 L0 12.6 L14 12.6 Z"/></svg>`
    case 'inverted':
      return `<svg ${open} viewBox="0 0 14 14"><path d="M0 0 L7 12.6 L14 0 Z"/></svg>`
    case 'diamond':
      return `<svg ${open} viewBox="0 0 18 18"><path d="M9 0 L0 9 L9 18 L18 9 Z"/></svg>`
    case 'star':
      return `<svg ${open} viewBox="0 0 22 22"><polygon points="11,1 13.94,6.95 20.51,7.91 15.76,12.55 16.88,19.09 11,16 5.12,19.09 6.24,12.55 1.49,7.91 8.06,6.95"/></svg>`
  }
}

export function SensorTypeIcon({
  type,
  size = 22,
  title,
}: {
  type: SensorTypeName
  size?: number
  title?: string
}) {
  return (
    <span
      className="sensor-type-icon"
      title={title ?? type}
      aria-hidden={!title}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: sensorTypeSvg(type, size) }}
    />
  )
}
