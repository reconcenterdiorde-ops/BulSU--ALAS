import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { useHistorical } from '../hooks/useHistorical'

const PARAMS = [
  { key: 'temp', label: 'Temp', unit: '°C', color: '#ef4444', cls: 'temp' },
  { key: 'humidity', label: 'Humidity', unit: '%', color: '#3b82f6', cls: 'hum' },
  { key: 'pressure', label: 'Pressure', unit: 'hPa', color: '#8b5cf6', cls: 'press' },
  { key: 'wind', label: 'Wind', unit: 'km/h', color: '#00e5b0', cls: 'wind' },
  { key: 'rain', label: 'Rainfall', unit: 'mm', color: '#06b6d4', cls: 'rain' },
]

const RANGES = [
  { key: '24h', label: '24H' },
  { key: '7d', label: '7 DAY' },
  { key: '30d', label: '30 DAY' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '.6rem .9rem',
      fontSize: '.75rem', boxShadow: '0 4px 12px rgba(0,0,0,.3)'
    }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '.65rem', color: 'var(--muted)', marginBottom: '.4rem' }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginTop: '.2rem' }}>
          {p.name}: <strong>{p.value !== null ? Number(p.value).toFixed(1) : '—'}</strong>
        </div>
      ))}
    </div>
  )
}

export default function HistoricalChart() {
  const [timeRange, setTimeRange] = useState('24h')
  const [activeParams, setActiveParams] = useState(['temp'])
  const { data, loading } = useHistorical(timeRange)

  function toggleParam(key) {
    setActiveParams(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    )
  }

  return (
    <>
      <div className="section-title">HISTORICAL TRENDS</div>

      <div className="card history-card">
        <div className="chart-controls">
          <div className="time-range-btns">
            {RANGES.map(r => (
              <button
                key={r.key}
                className={`time-btn ${timeRange === r.key ? 'active' : ''}`}
                onClick={() => setTimeRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="param-btns">
            {PARAMS.map(p => (
              <button
                key={p.key}
                className={`param-btn ${p.cls} ${activeParams.includes(p.key) ? 'active' : ''}`}
                onClick={() => toggleParam(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-txt">Loading chart data…</div>
        ) : data.length === 0 ? (
          <div className="loading-txt">No data available for this range</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: "'Space Mono',monospace" }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: "'Space Mono',monospace" }}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '.72rem',
                  fontFamily: "'Space Mono',monospace",
                  paddingTop: '.5rem'
                }}
              />
              {PARAMS.filter(p => activeParams.includes(p.key)).map(p => (
                <Line
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={`${p.label} (${p.unit})`}
                  stroke={p.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="chart-note">
          {timeRange === '24h'
            ? `RAW 15-MIN OBSERVATIONS · ${data.length} POINTS`
            : `HOURLY AVERAGES · ${data.length} POINTS`
          }
        </div>
      </div>
    </>
  )
}