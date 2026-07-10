// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(v, d = 1) { return (v === null || v === undefined) ? '—' : Number(v).toFixed(d) }
function pct(v, max) { return Math.min(100, Math.max(0, (Number(v) / max) * 100)) }

function feelIcon(t) {
  if (t === null || t === undefined) return '🌡️'
  if (t >= 40) return '🔥'
  if (t >= 35) return '☀️'
  if (t >= 28) return '🌡️'
  if (t >= 20) return '🌤️'
  if (t >= 10) return '❄️'
  return '🌨️'
}
function uvLabel(u) {
  if (u === null) return ''
  if (u < 3) return 'LOW'; if (u < 6) return 'MODERATE'
  if (u < 8) return 'HIGH'; if (u < 11) return 'VERY HIGH'
  return 'EXTREME'
}
function uvColor(u) {
  if (u === null) return 'var(--accent2)'
  if (u < 3) return '#22c55e'; if (u < 6) return '#eab308'
  if (u < 8) return '#f97316'; if (u < 11) return '#ef4444'
  return '#a855f7'
}
function uvAdvice(u) {
  if (u === null) return ''
  if (u < 3) return 'No protection needed'
  if (u < 6) return 'Wear sunscreen'
  if (u < 8) return 'Seek shade at midday'
  if (u < 11) return 'Avoid midday sun'
  return 'Stay indoors if possible'
}
function windDesc(k) {
  if (k === null || k === undefined) return ''
  if (k < 2) return 'Calm'; if (k < 12) return 'Light breeze'
  if (k < 20) return 'Gentle breeze'; if (k < 30) return 'Moderate breeze'
  if (k < 40) return 'Fresh breeze'; if (k < 50) return 'Strong breeze'
  if (k < 62) return 'Near gale'; return 'Gale'
}
function rainClass(r) {
  if (r === null || r === undefined) return ''
  if (r === 0) return 'No rain'; if (r < 2.5) return 'Light rain'
  if (r < 7.5) return 'Moderate rain'; if (r < 15) return 'Heavy rain'
  if (r < 30) return 'Very heavy rain'; return 'Torrential'
}
function voltStatus(v) {
  if (v === null || v === undefined) return { label: '—', color: 'var(--muted)' }
  if (v >= 12) return { label: 'GOOD', color: 'var(--accent2)' }
  if (v >= 11.5) return { label: 'LOW', color: 'var(--warn)' }
  return { label: 'CRITICAL', color: 'var(--danger)' }
}

// Temperature level thresholds
const TEMP_LEVELS = [
  { max: 18, label: 'COLD', color: '#60a5fa' },
  { max: 24, label: 'COOL', color: '#34d399' },
  { max: 28, label: 'COMFORTABLE', color: '#6ee7b7' },
  { max: 32, label: 'WARM', color: '#fbbf24' },
  { max: 36, label: 'HOT', color: '#f97316' },
  { max: 40, label: 'VERY HOT', color: '#ef4444' },
  { max: 99, label: 'DANGER', color: '#b91c1c' },
]
const T_MIN = 15, T_MAX = 45
function getLevel(t) {
  if (t === null || t === undefined) return null
  return TEMP_LEVELS.find(r => t < r.max) || TEMP_LEVELS[TEMP_LEVELS.length - 1]
}

// ── Shared primitives ─────────────────────────────────────────────────────────
const mono = { fontFamily: "'Space Mono',monospace" }

function TileLabel({ children }) {
  return <div style={{ ...mono, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{children}</div>
}
function Val({ children, color, size }) {
  return <div style={{ ...mono, fontSize: size || '1.7rem', fontWeight: 700, color: color || 'var(--text-bright)', lineHeight: 1 }}>{children}</div>
}
function Sub({ children, color }) {
  return <div style={{ ...mono, fontSize: '0.68rem', color: color || 'var(--muted)' }}>{children}</div>
}
function Bar({ p, color }) {
  return (
    <div style={{ width: '100%', height: 4, background: 'var(--bar-bg)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, p))}%`, height: '100%', borderRadius: 99, background: color || 'linear-gradient(90deg,var(--accent),var(--accent2))', transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  )
}
function Tile({ area, children, style }) {
  return (
    <div className="card" style={{ gridArea: area, padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', ...style }}>
      {children}
    </div>
  )
}
function Divider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
}

// ── Individual tiles ──────────────────────────────────────────────────────────
function TileTemp({ o }) {
  const temp = o?.temp ?? null
  const feel = o?.real_feel ?? null
  const uv = o?.uv_index ?? null
  const lv = getLevel(temp)
  const mPct = temp !== null ? Math.min(100, Math.max(0, ((temp - T_MIN) / (T_MAX - T_MIN)) * 100)) : null

  return (
    <Tile area="te">
      {/* ── Temperature ── */}
      <TileLabel>Temperature</TileLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <Val size="2.6rem">{fmt(temp, 1)}<span style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>°C</span></Val>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{feelIcon(temp)}</span>
      </div>
      <Sub>Feels like {fmt(feel, 1)}°C</Sub>

      {/* Level badge */}
      {lv && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: lv.color + '1a', border: `1px solid ${lv.color}55`, borderRadius: 99, padding: '0.2rem 0.65rem', width: 'fit-content' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: lv.color }} />
          <span style={{ ...mono, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', color: lv.color }}>{lv.label}</span>
        </div>
      )}

      {/* Gradient scale */}
      <div style={{
        position: 'relative', height: 8, borderRadius: 99, marginTop: '0.2rem',
        background: 'linear-gradient(90deg,#60a5fa,#34d399,#6ee7b7,#fbbf24,#f97316,#ef4444,#b91c1c)'
      }}>
        {mPct !== null && (
          <div style={{ position: 'absolute', left: `${mPct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: 'var(--surface)', border: `2.5px solid ${lv?.color || '#fff'}`, zIndex: 2, transition: 'left 1.2s cubic-bezier(.4,0,.2,1)' }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: '0.52rem', color: 'var(--muted)' }}>
        <span>15°</span><span>24°</span><span>32°</span><span>40°</span><span>45°C</span>
      </div>

      <Divider />

      {/* ── UV Index (integrated) ── */}
      <TileLabel>UV Index</TileLabel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Val color={uvColor(uv)}>{fmt(uv, 1)}<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}> / 11</span></Val>
        <span style={{ ...mono, fontSize: '0.62rem', fontWeight: 700, color: uvColor(uv), letterSpacing: '0.1em' }}>{uvLabel(uv)}</span>
      </div>
      <Bar p={pct(uv, 11)} color={uvColor(uv)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: '0.5rem', color: 'var(--muted)' }}>
        <span>LOW</span><span>MOD</span><span>HIGH</span><span>V.HI</span><span>EXT</span>
      </div>
      <Sub>{uvAdvice(uv)}</Sub>
    </Tile>
  )
}

function CompassRose({ deg }) {
  // deg is meteorological wind direction (where wind comes FROM)
  // Arrow points in the direction the wind is blowing TO
  const rotateDeg = deg !== null ? deg : 0
  const hasData = deg !== null

  return (
    <svg
      width="52" height="52" viewBox="0 0 52 52"
      aria-label={deg !== null ? `Wind direction: ${deg}°` : 'No wind direction data'}
      style={{ flexShrink: 0 }}
    >
      {/* Outer ring */}
      <circle cx="26" cy="26" r="24"
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />
      {/* Cardinal tick marks */}
      {[0, 90, 180, 270].map(a => {
        const rad = (a - 90) * Math.PI / 180
        return (
          <line key={a}
            x1={26 + 20 * Math.cos(rad)} y1={26 + 20 * Math.sin(rad)}
            x2={26 + 24 * Math.cos(rad)} y2={26 + 24 * Math.sin(rad)}
            stroke="var(--muted)" strokeWidth="1.5"
          />
        )
      })}
      {/* N label */}
      <text x="26" y="9"
        textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="700"
        fill="var(--muted)"
        fontFamily="'Space Mono',monospace"
      >N</text>
      {/* Direction arrow — rotates around center */}
      <g transform={`rotate(${rotateDeg}, 26, 26)`} opacity={hasData ? 1 : 0.2}>
        {/* Arrow head (pointing to where wind blows TO) */}
        <polygon
          points="26,8 22,22 26,18 30,22"
          fill="var(--accent)"
        />
        {/* Arrow tail */}
        <polygon
          points="26,44 24,32 26,36 28,32"
          fill="var(--muted)"
          opacity="0.5"
        />
      </g>
    </svg>
  )
}

function TileWind({ o }) {
  const avg = o?.wind_avg_kmh ?? null
  const max = o?.wind_max_kmh ?? null
  const dir = o?.wind_cardinal ?? null
  const deg = o?.wind_dir_deg ?? null

  return (
    <Tile area="wi">
      <TileLabel>Wind</TileLabel>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Compass rose */}
        <CompassRose deg={deg !== null ? Math.round(deg) : null} />

        {/* Values */}
        <div className="wind-sub-grid" style={{ flex: 1 }}>
          {[
            { lbl: 'AVG', val: fmt(avg, 1), color: 'var(--text-bright)' },
            { lbl: 'GUST', val: fmt(max, 1), color: 'var(--warn)' },
            { lbl: 'DIR', val: dir || '—', color: 'var(--icon-purple)' },
          ].map(({ lbl, val, color }) => (
            <div key={lbl}>
              <div style={{ ...mono, fontSize: '0.55rem', color, letterSpacing: '0.1em', opacity: 0.9 }}>{lbl}</div>
              <Val size="1.5rem" color={color}>{val}</Val>
              <Sub>{lbl === 'DIR' && deg !== null ? `${fmt(deg, 0)}°` : 'km/h'}</Sub>
            </div>
          ))}
        </div>
      </div>

      {/* Gust overlay bar */}
      <div style={{ position: 'relative', height: 5, background: 'var(--bar-bg)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct(avg, 80)}%`, background: 'var(--accent2)', transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct(max, 80)}%`, background: 'linear-gradient(90deg,transparent,var(--warn))', opacity: .7, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <Sub>{windDesc(avg)}</Sub>
    </Tile>
  )
}

function TileRainfall({ o }) {
  const int = o?.precip_int ?? null
  const qty = o?.precip_qty ?? null
  return (
    <Tile area="ra">
      <TileLabel>Rainfall</TileLabel>
      <Val>{fmt(int, 1)}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> mm/h</span></Val>
      <Bar p={pct(int, 20)} />
      <Sub>Accum. {fmt(qty, 1)} mm</Sub>
      <Sub>{rainClass(int)}</Sub>
    </Tile>
  )
}

function TileHumidity({ o }) {
  const val = o?.humidity ?? null

  function humInfo(h) {
    if (h === null) return { label: '', color: 'var(--muted)' }
    if (h < 30) return { label: 'Very dry', color: '#f97316' }
    if (h < 50) return { label: 'Comfortable', color: '#22c55e' }
    if (h < 70) return { label: 'Moderate', color: '#6ee7b7' }
    if (h < 85) return { label: 'Humid', color: '#eab308' }
    return { label: 'Very humid', color: '#ef4444' }
  }

  const { label, color } = humInfo(val)

  return (
    <Tile area="hm">
      <TileLabel>Humidity</TileLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <Val>{fmt(val, 0)}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>%</span></Val>
        <span style={{ ...mono, fontSize: '0.62rem', fontWeight: 700, color, letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <Bar p={pct(val, 100)} color={color} />
    </Tile>
  )
}

function TilePressure({ o }) {
  const val = o?.pressure ?? null
  // pressure_tendency is computed by Apps Script as a 3-hr delta (hPa)
  // and stored in the observations table. Positive = rising, negative = falling.
  const tendency = o?.pressure_tendency ?? null

  function tendencyInfo(t) {
    if (t === null || t === undefined) return null
    if (t > 1) return { label: 'Rising ↑', color: 'var(--accent2)' }
    if (t < -1) return { label: 'Falling ↓', color: 'var(--danger)' }
    return { label: 'Steady →', color: 'var(--muted)' }
  }

  const td = tendencyInfo(tendency)

  return (
    <Tile area="pr">
      <TileLabel>Pressure</TileLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', flexWrap: 'wrap' }}>
        <Val>{fmt(val, 1)}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> hPa</span></Val>
        {td && (
          <span style={{
            ...mono, fontSize: '0.62rem', fontWeight: 700,
            color: td.color, letterSpacing: '0.06em',
            whiteSpace: 'nowrap'
          }}>
            {td.label}
          </span>
        )}
      </div>
      <Sub>Sea-level equiv.{tendency !== null ? ` · ${tendency > 0 ? '+' : ''}${fmt(tendency, 1)} hPa/3hr` : ''}</Sub>
    </Tile>
  )
}

function TileSolar({ o }) {
  const val = o?.radiation ?? null
  return (
    <Tile area="so">
      <TileLabel>Solar Radiation</TileLabel>
      <Val>{fmt(val, 0)}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> W/m²</span></Val>
      <Bar p={pct(val, 1200)} color="#eab308" />
    </Tile>
  )
}

function TileVoltage({ o }) {
  const volt = o?.u_supply ?? null
  const { label, color } = voltStatus(volt)
  const barPct = volt !== null ? Math.min(100, Math.max(0, ((volt - 10) / (14.5 - 10)) * 100)) : 0
  return (
    <Tile area="vo">
      <TileLabel>Supply Voltage</TileLabel>
      <Val>{fmt(volt, 2)}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> V</span></Val>
      <Bar p={barPct} color={color} />
      <div style={{ ...mono, fontSize: '0.62rem', fontWeight: 700, color, letterSpacing: '0.1em' }}>{label}</div>
    </Tile>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonTile({ area, tall }) {
  return (
    <div className="card" style={{ gridArea: area, padding: '1.1rem 1.2rem', minHeight: tall ? 180 : 90 }}>
      <div className="skeleton" style={{ width: '50%', height: 9, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: '75%', height: tall ? 36 : 24, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '60%', height: 8 }} />
    </div>
  )
}

// ── Main export — bento grid ──────────────────────────────────────────────────
// Layout is controlled by the .bento-grid CSS class in index.css so that
// media queries can override grid-template-areas at each breakpoint.
// Inline styles cannot respond to media queries — that was the overlap bug.
//
// Desktop  ≥1024px: "te te wi ra" / "te te hm hm" / "pr pr so vo"
// Tablet   640-1023px: 2 columns, temp spans full width
// Mobile   <640px:   single column, all tiles stacked

export default function CurrentConditions({ observation, loading }) {
  if (loading) {
    return (
      <div className="bento-grid">
        <SkeletonTile area="te" tall />
        <SkeletonTile area="wi" />
        <SkeletonTile area="ra" />
        <SkeletonTile area="hm" />
        <SkeletonTile area="pr" />
        <SkeletonTile area="so" />
        <SkeletonTile area="vo" />
      </div>
    )
  }

  const o = observation || {}
  return (
    <div className="bento-grid">
      <TileTemp o={o} />
      <TileWind o={o} />
      <TileRainfall o={o} />
      <TileHumidity o={o} />
      <TilePressure o={o} />
      <TileSolar o={o} />
      <TileVoltage o={o} />
    </div>
  )
}