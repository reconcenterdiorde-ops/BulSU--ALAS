import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { useHistorical } from '../hooks/useHistorical'

/**
 * Interactive historical weather chart.
 * Users can switch time ranges (24h / 7d / 30d) and toggle
 * which parameters are displayed on the chart.
 */

const PARAMS = [
  { key: 'temp',     label: 'Temperature', unit: '°C',   color: '#ef4444', cls: 'temp'  },
  { key: 'humidity', label: 'Humidity',    unit: '%',    color: '#3b82f6', cls: 'hum'   },
  { key: 'pressure', label: 'Pressure',    unit: 'hPa',  color: '#8b5cf6', cls: 'press' },
  { key: 'wind',     label: 'Wind',        unit: 'km/h', color: '#10b981', cls: 'wind'  },
  { key: 'rain',     label: 'Rainfall',    unit: 'mm',   color: '#06b6d4', cls: 'rain'  },
]

const TIME_RANGES = [
  { key: '24h', label: '24h' },
  { key: '7d',  label: '7 days' },
  { key: '30d', label: '30 days' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '.6rem .9rem',
      fontSize: '.8rem',
      boxShadow: '0 4px 6px rgba(0,0,0,.07)'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '.3rem', color: '#334155' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginTop: '.15rem' }}>
          {p.name}: <strong>{p.value !== null ? Number(p.value).toFixed(1) : '—'}</strong>
        </div>
      ))}
    </div>
  )
}

export default function HistoricalChart() {
  const [timeRange,      setTimeRange]      = useState('24h')
  const [activeParams,   setActiveParams]   = useState(['temp'])

  const { data, loading } = useHistorical(timeRange)

  function toggleParam(key) {
    setActiveParams(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    )
  }

  return (
    <div className="card">
      <div className="card-title">Historical Trends</div>

      <div className="chart-controls">
        {/* Time range selector */}
        <div className="time-range-btns">
          {TIME_RANGES.map(r => (
            <button
              key={r.key}
              className={`time-btn ${timeRange === r.key ? 'active' : ''}`}
              onClick={() => setTimeRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Parameter toggles */}
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
        <div className="loading">Loading chart data…</div>
      ) : data.length === 0 ? (
        <div className="loading">No historical data available for this range</div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '.8rem', paddingTop: '.5rem' }}
              />

              {PARAMS.filter(p => activeParams.includes(p.key)).map(p => (
                <Line
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={`${p.label} (${p.unit})`}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '.75rem' }}>
        {timeRange === '24h'
          ? 'Showing raw 15-minute observations'
          : `Showing hourly averages · ${data.length} data points`
        }
      </div>
    </div>
  )
}
