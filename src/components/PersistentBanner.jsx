import { useState, useEffect } from 'react'

// ── Duration rules (minutes) ──────────────────────────────────────────────────
const DURATION = {
    'EXTREME': Infinity,
    'INTENSE': Infinity,
    'SEVERE': 180,
    'DANGER': 180,
    'HIGH': 120,
    'VERY HIGH': 120,
    'ALERT': 120,
    'MODERATE': 60,
    'CAUTION': 60,
    'HEAVY': 60,
    'LOW': 30,
}

const SEV_ORDER = [
    'EXTREME', 'INTENSE', 'SEVERE', 'DANGER',
    'VERY HIGH', 'HIGH', 'ALERT',
    'MODERATE', 'CAUTION', 'HEAVY', 'LOW'
]

const MAX_STACK = 4

function isBannerActive(alert) {
    const maxMin = DURATION[(alert.severity || '').toUpperCase()] ?? 30
    if (maxMin === Infinity) return true
    const ageMin = (Date.now() - new Date(alert.alerted_at)) / 60000
    return ageMin < maxMin
}

function sevStyle(sev) {
    const s = (sev || '').toUpperCase()
    if (['EXTREME', 'INTENSE'].includes(s))
        return { border: '#dc2626', bg: 'rgba(185,28,28,.10)', color: '#dc2626', icon: '🚨', flash: true }
    if (['SEVERE', 'DANGER'].includes(s))
        return { border: '#ef4444', bg: 'rgba(239,68,68,.08)', color: '#ef4444', icon: '⚠', flash: false }
    if (['HIGH', 'VERY HIGH', 'ALERT'].includes(s))
        return { border: '#f97316', bg: 'rgba(249,115,22,.08)', color: '#f97316', icon: '⚠', flash: false }
    if (['MODERATE', 'CAUTION', 'HEAVY'].includes(s))
        return { border: '#eab308', bg: 'rgba(234,179,8,.08)', color: '#ca8a04', icon: '⚠', flash: false }
    return { border: '#22c55e', bg: 'rgba(34,197,94,.07)', color: '#16a34a', icon: 'ℹ', flash: false }
}

function ageLabel(ts) {
    const min = Math.floor((Date.now() - new Date(ts)) / 60000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    return `${Math.floor(min / 60)}h ago`
}

export default function PersistentBanner({ alerts, onViewAll }) {
    const [, tick] = useState(0)
    useEffect(() => {
        const t = setInterval(() => tick(n => n + 1), 60000)
        return () => clearInterval(t)
    }, [])

    if (!alerts || alerts.length === 0) return null

    const seen = new Set()
    const visible = alerts
        .filter(a => isBannerActive(a))
        .filter(a => {
            if (seen.has(a.alert_type)) return false
            seen.add(a.alert_type)
            return true
        })
        .sort((a, b) => {
            const ai = SEV_ORDER.indexOf((a.severity || '').toUpperCase())
            const bi = SEV_ORDER.indexOf((b.severity || '').toUpperCase())
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
        })

    if (visible.length === 0) return null

    const shown = visible.slice(0, MAX_STACK)
    const extras = visible.length - MAX_STACK

    return (
        <div className="banner-stack">
            {shown.map(alert => {
                const s = sevStyle(alert.severity)
                return (
                    <div
                        key={alert.id}
                        className={`banner-item${s.flash ? ' banner-flash' : ''}`}
                        style={{
                            borderLeft: `4px solid ${s.border}`,
                            background: s.bg,
                        }}
                    >
                        {/* ── Top row: always visible ── */}
                        <div className="banner-top">
                            <span className="banner-icon">{s.icon}</span>
                            <span className="banner-type" style={{ color: s.color }}>
                                {alert.alert_type}
                            </span>
                            <span className="banner-value" style={{ color: s.color }}>
                                {alert.value}
                            </span>
                            <span className="banner-age">
                                {ageLabel(alert.alerted_at)}
                            </span>
                        </div>

                        {/* ── Message row: truncated on mobile, full on desktop ── */}
                        <div className="banner-msg">
                            {alert.message}
                        </div>
                    </div>
                )
            })}

            {extras > 0 && (
                <button className="banner-more" onClick={onViewAll}>
                    +{extras} more active alert{extras > 1 ? 's' : ''} — view all ↓
                </button>
            )}
        </div>
    )
}