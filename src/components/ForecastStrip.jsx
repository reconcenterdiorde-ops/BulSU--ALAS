import { format, parseISO } from 'date-fns'

// ── Weather icon based on cloud cover + rain probability ──────────────────
function weatherIcon(cloudCover, precipProb) {
  if (precipProb >= 70) return '🌧️'
  if (precipProb >= 40) return '🌦️'
  if (cloudCover <= 20) return '☀️'
  if (cloudCover <= 50) return '🌤️'
  if (cloudCover <= 80) return '🌥️'
  return '☁️'
}

function fmt(v, d = 1) {
  return (v === null || v === undefined) ? '—' : Number(v).toFixed(d)
}

function ForecastCard({ item, isFirst }) {
  const time = format(parseISO(item.forecast_time), 'h:mm a')
  const precipProb = Number(item.precip_prob ?? 0)
  const cloudCover = Number(item.cloud_cover ?? 0)
  const icon = weatherIcon(cloudCover, precipProb)

  return (
    <div
      className="card"
      style={{
        padding: '1.2rem 1rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        alignItems: 'center',
        border: isFirst ? '1px solid rgba(59,143,255,.45)' : undefined,
        background: isFirst ? 'rgba(59,143,255,.06)' : undefined,
      }}
    >
      {/* Time label */}
      <div style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: isFirst ? 'var(--accent)' : 'var(--muted)',
        textTransform: 'uppercase',
      }}>
        {isFirst ? 'NEXT HOUR' : time}
      </div>

      {/* Weather emoji */}
      <div style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</div>

      {/* Temperature */}
      <div style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-bright)',
        lineHeight: 1,
      }}>
        {fmt(item.temp, 1)}<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>°C</span>
      </div>

      {/* Rain probability */}
      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>
        💧 {precipProb}%
      </div>

      {/* Cloud cover */}
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
        ☁ {fmt(cloudCover, 0)}% cloud
      </div>

      {/* Precipitation amount — only show if meaningful */}
      {item.precip_amt > 0 && (
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--muted)',
          fontFamily: "'Space Mono',monospace",
        }}>
          {fmt(item.precip_amt, 1)} mm
        </div>
      )}
    </div>
  )
}

export default function ForecastStrip({ forecast, loading }) {
  if (loading) {
    return (
      <>
        <div className="section-title">4-HOUR FORECAST</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="loading-txt" style={{ padding: '1.5rem 0', fontSize: '0.65rem' }}>
                Loading…
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  if (!forecast || forecast.length === 0) {
    return (
      <>
        <div className="section-title">4-HOUR FORECAST</div>
        <div className="loading-txt">No forecast data available</div>
      </>
    )
  }

  return (
    <>
      <div className="forecast-header">
        <div className="section-title">4-HOUR FORECAST</div>
        <div className="forecast-meta">
          SOURCE: <span>OPEN-METEO NWP</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: '1rem',
      }}>
        {forecast.slice(0, 4).map((item, i) => (
          <ForecastCard key={item.id} item={item} isFirst={i === 0} />
        ))}
      </div>
    </>
  )
}