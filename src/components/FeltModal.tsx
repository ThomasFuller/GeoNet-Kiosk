import { FELT_IT_URL } from '../api/geonet'

export function FeltModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="felt-modal" role="dialog" aria-modal="true" aria-labelledby="felt-title">
      <button type="button" className="felt-modal-scrim" aria-label="Close" onClick={onClose} />
      <div className="felt-modal-card card">
        <img src="/brand/icons/earthquake.svg" alt="" />
        <h2 id="felt-title">Felt It?</h2>
        <p>
          If the ground shook, GeoNet scientists want to know what you felt. That helps them map
          shaking across Aotearoa.
        </p>
        <p className="muted">
          On this kiosk, ask a host to open the GeoNet app or website. Look up the earthquake, then
          tap <strong>Felt It?</strong>
        </p>
        <p className="felt-url">{FELT_IT_URL.replace('https://', '')}</p>
        <button type="button" className="touch-btn primary" onClick={onClose}>
          Back to the kiosk
        </button>
      </div>
    </div>
  )
}
