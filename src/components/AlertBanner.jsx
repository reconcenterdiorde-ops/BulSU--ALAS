import { AlertTriangle } from 'lucide-react'

/**
 * Displays active PAGASA-aligned weather warnings.
 * Color-coded by severity (red/orange/yellow).
 * Hidden entirely when no active alerts exist.
 */
export default function AlertBanner({ alerts, loading }) {
  if (loading || alerts.length === 0) return null

  // Deduplicate: show only the most recent alert per alert_type
  const seen = new Set()
  const unique = alerts.filter(a => {
    if (seen.has(a.alert_type)) return false
    seen.add(a.alert_type)
    return true
  })

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
        <AlertTriangle size={13} />
        Active Warnings
      </div>
      <div className="alert-banner">
        {unique.map((alert) => (
          <div key={alert.id} className={`alert-item ${alert.severity}`}>
            <span className="alert-type">{alert.alert_type}</span>
            <span className="alert-msg">{alert.message}</span>
            <span className="alert-value">{alert.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
