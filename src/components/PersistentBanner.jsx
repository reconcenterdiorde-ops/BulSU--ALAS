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
    if (min < 60) return `${min} min ago`
    return `${Math.floor(min / 60)} hr ago`
}

export default function PersistentBanner({ alerts, onViewAll }) {
    // Re-evaluate every 60 s so expired low-severity banners auto-remove
    const [, tick] = useState(0)
    useEffect(() => {
        const t = setInterval(() => tick(n => n + 1), 60000)
        return () => clearInterval(t)
    }, [])

    if (!alerts || alerts.length === 0) return null

    // Deduplicate by alert_type, filter by duration, sort by severity
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.9rem' }}>
            {shown.map(alert => {
                const s = sevStyle(alert.severity)
                return (
                    <div
                        key={alert.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.7rem 1.1rem',
                            borderRadius: 'var(--radius)',
                            borderLeft: `4px solid ${s.border}`,
                            background: s.bg,
                            animation: s.flash ? 'flashBg .85s ease-in-out infinite alternate' : undefined,
                        }}
                    >
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>

                        <span style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.66rem', fontWeight: 700,
                            letterSpacing: '0.1em', color: s.color,
                            whiteSpace: 'nowrap'
                        }}>
                            {alert.alert_type}
                        </span>

                        <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text)' }}>
                            {alert.message}
                        </span>

                        <span style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.7rem', fontWeight: 700,
                            color: s.color, whiteSpace: 'nowrap'
                        }}>
                            {alert.value}
                        </span>

                        <span style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.6rem', color: 'var(--muted)',
                            whiteSpace: 'nowrap'
                        }}>
                            {ageLabel(alert.alerted_at)}
                        </span>
                    </div>
                )
            })}

            {extras > 0 && (
                <button
                    onClick={onViewAll}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        fontFamily: "'Space Mono',monospace", fontSize: '0.62rem',
                        color: 'var(--accent)', paddingLeft: '1.1rem', letterSpacing: '0.06em',
                    }}
                >
                    +{extras} more active alert{extras > 1 ? 's' : ''} — view all ↓
                </button>
            )}
        </div>
    )
}