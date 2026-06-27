import { AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

// Map severity string → banner CSS class
function sevClass(sev) {
  if (!sev) return 'sev-low'
  const s = sev.toUpperCase()
  if (['EXTREME', 'INTENSE'].includes(s)) return 'sev-extreme'
  if (['SEVERE', 'DANGER', 'HIGH', 'VERY HIGH'].includes(s)) return 'sev-high'
  if (['MODERATE', 'CAUTION', 'ALERT'].includes(s)) return 'sev-moderate'
  return 'sev-low'
}

// Show the single highest-severity active alert (matching ALAS_v4's single-banner style)
function highestAlert(alerts) {
  const order = ['EXTREME', 'INTENSE', 'SEVERE', 'DANGER', 'VERY HIGH', 'HIGH', 'MODERATE', 'CAUTION', 'ALERT', 'HEAVY', 'LOW']
  return alerts.slice().sort((a, b) => {
    const ai = order.indexOf((a.severity || '').toUpperCase())
    const bi = order.indexOf((b.severity || '').toUpperCase())
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })[0]
}

export default function AlertBanner({ alerts, loading }) {
  if (loading || !alerts || alerts.length === 0) return null

  const alert = highestAlert(alerts)
  if (!alert) return null

  const ago = alert.alerted_at
    ? formatDistanceToNow(parseISO(alert.alerted_at), { addSuffix: true })
    : ''

  return (
    <div className={`alert-banner ${sevClass(alert.severity)}`}>
      <div className="alert-icon">
        <AlertTriangle size={18} />
      </div>
      <span className="alert-type">{alert.alert_type}</span>
      <span className="alert-msg">{alert.message}</span>
      <span className="alert-value">{alert.value}</span>
      <span className="alert-ts">{ago}</span>
    </div>
  )
}