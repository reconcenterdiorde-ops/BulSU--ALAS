import { useState, useEffect } from 'react'
import { Sun, Moon }           from 'lucide-react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import bulsuLogo from '../assets/images/bulsu-logo.png'
import reconLogo from '../assets/images/recon-logo.png'

// ── Data freshness thresholds ─────────────────────────────────────────────────
// Green  < 20 min  — within 1–2 normal 15-min cycles
// Yellow 20–45 min — 1–3 missed cycles, may be transient
// Red    > 45 min  — watchdog territory, data gap
function stalenessStatus(recordedAt) {
  if (!recordedAt) return { label: 'NO DATA', color: 'var(--danger)',  cls: 'error' }
  const minAgo = (Date.now() - new Date(recordedAt)) / 60000
  if (minAgo < 20)  return { label: 'LIVE',    color: 'var(--accent2)', cls: 'live'  }
  if (minAgo < 45)  return { label: 'DELAYED', color: 'var(--warn)',    cls: 'live'  }
  return               { label: 'STALE',   color: 'var(--danger)',  cls: 'error' }
}

export default function Header({ observation, theme, toggleTheme }) {
  // Relative timestamp re-renders every minute so "3 minutes ago" stays fresh
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const recordedAt = observation?.recorded_at || null
  const status     = stalenessStatus(recordedAt)
  const temp       = observation?.temp

  // ── Win: Live temperature in browser tab ──────────────────────────────────
  // Updates every time a new observation arrives via the real-time subscription
  useEffect(() => {
    document.title = temp !== null && temp !== undefined
      ? `${Number(temp).toFixed(1)}°C · BulSU-ALAS(01)`
      : 'BulSU-ALAS(01) — Malolos City'
    return () => { document.title = 'BulSU-ALAS(01) — Malolos City' }
  }, [temp])

  // ── Win: Relative + absolute timestamp ────────────────────────────────────
  const relativeTime = recordedAt
    ? formatDistanceToNow(parseISO(recordedAt), { addSuffix: true })
    : null
  const absoluteTime = recordedAt
    ? format(parseISO(recordedAt), 'MMM d, yyyy  HH:mm')
    : null

  return (
    <header>
      <div className="header-top">
        <div className="header-left">
          <img src={bulsuLogo} alt="BulSU" onError={e => e.target.style.display='none'} />
          <img src={reconLogo}  alt="RECON"  onError={e => e.target.style.display='none'} />
          <div className="title-divider" />
          <div>
            <div className="title-main">
              BulSU‑ALAS<span style={{ color:'var(--accent)' }}>(01)</span>
            </div>
            <div className="title-sub-line1">AUTOMATED LOCAL AREA STATION — MALOLOS CITY, BULACAN</div>
            <div className="title-sub-line2">
              14.8601°N · 120.8142°E · ELEV. 30 m · OTT netDL 1000 · Kipp &amp; Zonen SMP10‑A
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* ── Win: Staleness-aware status badge (replaces simple LIVE dot) ── */}
          <span
            className={`status-badge ${status.cls}`}
            style={{ borderColor: status.color, color: status.color }}
          >
            {status.label}
          </span>

          <button
            className="theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* ── Win: "Updated 3 minutes ago" relative + absolute time ── */}
      <div className="live-row">
        {relativeTime
          ? <>
              LAST UPDATE:&nbsp;
              <strong style={{ color:'var(--text-bright)' }}>{relativeTime}</strong>
              <span style={{ color:'var(--muted)', margin:'0 0.4rem' }}>·</span>
              <span style={{ color:'var(--muted)' }}>{absoluteTime}</span>
              <span style={{ color:'var(--muted)', margin:'0 0.4rem' }}>·</span>
              DATA SOURCE: SUPABASE REAL‑TIME
            </>
          : 'WAITING FOR DATA…'
        }
      </div>
    </header>
  )
}