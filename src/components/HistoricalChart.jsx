import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { format, parseISO } from 'date-fns'
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

// ── X-axis tick spacing ───────────────────────────────────────────────────
// BUGFIX (overlapping timestamps): the previous interval="preserveStartEnd"
// is a Recharts heuristic that does NOT reliably prevent overlap once data
// gets dense — 24h has up to 96 points, 7d up to 168, 30d up to 720. With
// that many category ticks, the heuristic frequently undershoots and labels
// stack on top of each other.
//
// Fix: explicitly target a fixed, readable number of visible ticks per range
// and compute the Recharts `interval` (ticks to SKIP between shown ticks)
// from the ACTUAL data length, so spacing stays even and non-overlapping
// no matter how many points are returned (including sparse/gappy data).
const TICK_TARGETS = { '24h': 8, '7d': 7, '30d': 10 }

function calcTickInterval(dataLength, targetTicks) {
  if (dataLength <= targetTicks) return 0 // few enough points — show them all
  return Math.ceil(dataLength / targetTicks) - 1
}

// Ticks render compact labels; the tooltip still shows full precision via
// each row's `fullTime` field, so no information is lost by shortening ticks.
function formatTick(value, index, timeRange, data) {
  if (timeRange === '24h') return value // "HH:mm" is already compact

  const row = data[index]
  if (!row?.fullTime) return value

  // 7-day ticks were "MM/dd HH:mm" (11 chars) — too wide once several are
  // visible side by side. Shorten to a clean date-only label for the axis.
  return format(parseISO(row.fullTime), 'MMM d')
}

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
                interval={calcTickInterval(data.length, TICK_TARGETS[timeRange])}
                tickFormatter={(value, index) => formatTick(value, index, timeRange, data)}
                minTickGap={24}
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