import type { ChartPeriod } from '../api/geonet'

export type { ChartPeriod }

export const CHART_PERIODS: Array<{ id: ChartPeriod; label: string }> = [
  { id: '1d', label: '24 hours' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
]

export function periodMs(period: ChartPeriod): number {
  if (period === '7d') return 7 * 86_400_000
  if (period === '30d') return 30 * 86_400_000
  return 86_400_000
}

export function periodCaption(period: ChartPeriod): string {
  if (period === '7d') return 'Time across the last 7 days. Newest on the right.'
  if (period === '30d') return 'Time across the last 30 days. Newest on the right.'
  return 'Time across the last 24 hours. Newest on the right.'
}

export function PeriodPicker({
  value,
  onChange,
}: {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}) {
  return (
    <div className="period-picker" role="radiogroup" aria-label="Chart time period">
      <span className="period-label">Show</span>
      {CHART_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={value === p.id}
          className={`filter-chip${value === p.id ? ' active' : ''}`}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
