import { format, parseISO } from 'date-fns'

/**
 * Site header showing station identity, live status dot,
 * and the timestamp of the most recent observation.
 */
export default function Header({ observation }) {
  const isOnline  = observation !== null
  const updatedAt = observation?.recorded_at
    ? format(parseISO(observation.recorded_at), 'MMM d, yyyy h:mm a')
    : '—'

  return (
    <header className="header">
      <div className="header-inner">
        <div>
          <div className="header-title">BulSU-ALAS(01)</div>
          <div className="header-subtitle">Malolos City, Bulacan · 14.8601°N 120.8142°E · Elev. 30m</div>
        </div>

        <div className="header-right">
          <div className={`status-dot ${isOnline ? '' : 'offline'}`}>
            {isOnline ? 'Station Online' : 'No Data'}
          </div>
          <div className="last-updated">
            {isOnline ? `Updated ${updatedAt}` : 'Waiting for data…'}
          </div>
        </div>
      </div>
    </header>
  )
}
