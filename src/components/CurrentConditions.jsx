import { Thermometer, Droplets, Wind, CloudRain, Sun, Gauge, Navigation, Zap } from 'lucide-react'

/**
 * Displays all current sensor readings as a responsive metric card grid.
 * The "Real Feel" card is highlighted in blue as the key comfort indicator.
 */

function fmt(val, decimals = 1) {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(decimals)
}

function windDescription(kmh) {
  if (kmh === null || kmh === undefined) return ''
  if (kmh < 2)  return 'Calm'
  if (kmh < 12) return 'Light breeze'
  if (kmh < 30) return 'Moderate breeze'
  if (kmh < 50) return 'Fresh wind'
  if (kmh < 62) return 'Strong wind'
  return 'Gale'
}

function uvDescription(uv) {
  if (uv === null || uv === undefined) return ''
  if (uv < 3)  return 'Low'
  if (uv < 6)  return 'Moderate'
  if (uv < 8)  return 'High'
  if (uv < 11) return 'Very High'
  return 'Extreme'
}

function MetricCard({ label, value, unit, sub, highlight }) {
  return (
    <div className={`metric-card ${highlight ? 'highlight' : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}

export default function CurrentConditions({ observation, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Current Conditions</div>
        <div className="conditions-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="metric-card">
              <div className="skeleton" style={{ width: '60%', marginBottom: '.5rem' }} />
              <div className="skeleton" style={{ width: '80%', height: '2rem' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const o = observation || {}

  return (
    <div className="card">
      <div className="card-title">Current Conditions</div>
      <div className="conditions-grid">

        <MetricCard
          label="Temperature"
          value={fmt(o.temp)}
          unit="°C"
        />

        <MetricCard
          label="Real Feel"
          value={fmt(o.real_feel)}
          unit="°C"
          highlight
        />

        <MetricCard
          label="Humidity"
          value={fmt(o.humidity, 0)}
          unit="%"
        />

        <MetricCard
          label="Pressure"
          value={fmt(o.pressure, 1)}
          unit=" hPa"
        />

        <MetricCard
          label="Wind Speed"
          value={fmt(o.wind_avg_kmh, 1)}
          unit=" km/h"
          sub={`${o.wind_cardinal || '—'}  ·  Max ${fmt(o.wind_max_kmh)} km/h`}
        />

        <MetricCard
          label="Wind Direction"
          value={o.wind_cardinal || '—'}
          sub={`${fmt(o.wind_dir_deg, 0)}°`}
        />

        <MetricCard
          label="Rainfall"
          value={fmt(o.precip_int, 1)}
          unit=" mm/h"
          sub={`Accum. ${fmt(o.precip_qty, 1)} mm`}
        />

        <MetricCard
          label="UV Index"
          value={fmt(o.uv_index, 1)}
          sub={uvDescription(o.uv_index)}
        />

        <MetricCard
          label="Solar Radiation"
          value={fmt(o.radiation, 0)}
          unit=" W/m²"
        />

        <MetricCard
          label="Station Voltage"
          value={fmt(o.u_supply, 1)}
          unit=" V"
          sub="Power supply"
        />

      </div>
    </div>
  )
}
