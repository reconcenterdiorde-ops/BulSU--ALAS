import { Sun, Moon } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function Header({ observation, theme, toggleTheme }) {
  const isLive = !!observation
  const updatedAt = observation?.recorded_at
    ? format(parseISO(observation.recorded_at), 'MMM d, yyyy  HH:mm')
    : null

  return (
    <header>
      <div className="header-top">
        <div className="header-left">
          {/* Station logos — replace src with your actual logo paths */}
          <img src="/bulsu-logo.png" alt="BulSU" onError={e => e.target.style.display = 'none'} />
          <img src="/drrm-logo.png" alt="DRRM" onError={e => e.target.style.display = 'none'} />

          <div className="title-divider" />

          <div>
            <div className="title-main">BulSU‑ALAS<span style={{ color: 'var(--accent)' }}>(01)</span></div>
            <div className="title-sub-line1">AUTOMATED LOCAL-WEATHER ASSESSMENT SYSTEM — MALOLOS CITY, BULACAN</div>
            <div className="title-sub-line2">
              14.8601°N · 120.8142°E · ELEV. 30 m · OTT netDL 1000 · Kipp &amp; Zonen SMP10‑A
            </div>
          </div>
        </div>

        <div className="header-right">
          <span className={`status-badge ${isLive ? 'live' : 'error'}`}>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun size={15} />
              : <Moon size={15} />
            }
          </button>
        </div>
      </div>

      <div className="live-row">
        {updatedAt
          ? <>LAST UPDATE: <strong style={{ color: 'var(--text-bright)' }}>{updatedAt}</strong> · DATA SOURCE: SUPABASE REAL‑TIME</>
          : 'WAITING FOR DATA…'
        }
      </div>
    </header>
  )
}