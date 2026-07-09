import { useState, useRef } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

const SEV_ORDER = [
    'EXTREME', 'INTENSE', 'SEVERE', 'DANGER',
    'VERY HIGH', 'HIGH', 'ALERT',
    'MODERATE', 'CAUTION', 'HEAVY', 'LOW'
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function sevStyle(sev) {
    const s = (sev || '').toUpperCase()
    if (['EXTREME', 'INTENSE'].includes(s)) return { bg: 'rgba(185,28,28,.10)', color: '#dc2626' }
    if (['SEVERE', 'DANGER'].includes(s)) return { bg: 'rgba(239,68,68,.08)', color: '#ef4444' }
    if (['HIGH', 'VERY HIGH', 'ALERT'].includes(s)) return { bg: 'rgba(249,115,22,.08)', color: '#f97316' }
    if (['MODERATE', 'CAUTION', 'HEAVY'].includes(s)) return { bg: 'rgba(234,179,8,.08)', color: '#ca8a04' }
    return { bg: 'rgba(34,197,94,.07)', color: '#16a34a' }
}

function SevBadge({ severity }) {
    const { bg, color } = sevStyle(severity)
    return (
        <span style={{
            background: bg, color,
            padding: '1px 6px', borderRadius: 4,
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.08em', whiteSpace: 'nowrap',
            fontFamily: "'Space Mono',monospace"
        }}>
            {severity}
        </span>
    )
}

function SubLabel({ children }) {
    return (
        <div style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--muted)', padding: '0.85rem 0 0.45rem'
        }}>
            {children}
        </div>
    )
}

function exportCSV(history) {
    const header = 'Date & Time,Alert Type,Severity,Value,Message\n'
    const rows = (history || []).map(a => {
        const ts = format(parseISO(a.alerted_at), 'yyyy-MM-dd HH:mm')
        return `"${ts}","${a.alert_type}","${a.severity}","${a.value}","${(a.message || '').replace(/"/g, '""')}"`
    }).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ALAS01_Alerts_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlertsPanel({ activeAlerts, history, historyLoading, defaultExpanded }) {
    const [expanded, setExpanded] = useState(defaultExpanded || false)
    const panelRef = useRef(null)

    const hasActive = activeAlerts && activeAlerts.length > 0
    const total = history?.length || 0

    function handleToggle() {
        setExpanded(e => !e)
    }

    function handleExpand() {
        setExpanded(true)
        setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    // Expose handleExpand for PersistentBanner "+N more" link
    if (typeof window !== 'undefined') {
        window.__alertsPanelExpand = handleExpand
    }

    return (
        <div
            ref={panelRef}
            style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                marginBottom: '1.25rem'
            }}
        >
            {/* ── Clickable header — always visible ── */}
            <div
                onClick={handleToggle}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 1.1rem',
                    background: 'var(--surface)',
                    cursor: 'pointer', userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem' }}>{hasActive ? '🔔' : '🔕'}</span>

                    <span style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '0.66rem', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--text-bright)'
                    }}>
                        Alerts &amp; History
                    </span>

                    {hasActive ? (
                        <span style={{
                            background: 'rgba(239,68,68,.12)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,.3)',
                            padding: '1px 8px', borderRadius: 99,
                            fontSize: '0.62rem', fontWeight: 700,
                            letterSpacing: '0.08em',
                            fontFamily: "'Space Mono',monospace"
                        }}>
                            {activeAlerts.length} ACTIVE
                        </span>
                    ) : (
                        <span style={{
                            background: 'rgba(34,197,94,.10)', color: '#16a34a',
                            border: '1px solid rgba(34,197,94,.25)',
                            padding: '1px 8px', borderRadius: 99,
                            fontSize: '0.62rem', fontWeight: 700,
                            letterSpacing: '0.08em',
                            fontFamily: "'Space Mono',monospace"
                        }}>
                            ALL CLEAR
                        </span>
                    )}

                    <span style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '0.58rem', color: 'var(--muted)',
                        letterSpacing: '0.04em'
                    }}>
                        {total > 0 ? `${total} alert${total > 1 ? 's' : ''} in last 14 days` : 'No history'}
                    </span>
                </div>

                <span style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '0.65rem', color: 'var(--muted)',
                    display: 'inline-block',
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                    flexShrink: 0,
                }}>▼</span>
            </div>

            {/* ── Expanded body — scrollable, capped at 60vh ──
          The header stays fixed above; only this body scrolls.
          On mobile this is reduced to 55vh via the media query in index.css. ── */}
            {expanded && (
                <div
                    className="alerts-panel-body"
                    style={{
                        background: 'var(--bg)',
                        padding: '0 1.1rem 1.1rem',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--border) transparent',
                    }}
                >
                    {/* ── Top toolbar — always visible at the top of the scroll area ── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0',
                        borderBottom: '1px solid var(--border)',
                        marginBottom: '0.1rem',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--bg)',
                        zIndex: 2,
                    }}>
                        <span style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.58rem',
                            color: 'var(--muted)',
                            letterSpacing: '0.04em',
                        }}>
                            {total > 0
                                ? `${total} alert${total > 1 ? 's' : ''} · last 14 days`
                                : 'No alert history'
                            }
                        </span>
                        <button
                            onClick={e => { e.stopPropagation(); exportCSV(history) }}
                            disabled={total === 0}
                            style={{
                                fontFamily: "'Space Mono',monospace",
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: total > 0 ? 'var(--accent)' : 'var(--muted)',
                                border: `1px solid ${total > 0 ? 'var(--accent)' : 'var(--border)'}`,
                                background: 'transparent',
                                padding: '0.2rem 0.65rem',
                                borderRadius: 6,
                                cursor: total > 0 ? 'pointer' : 'default',
                                letterSpacing: '0.06em',
                                opacity: total > 0 ? 1 : 0.5,
                            }}
                        >
                            ↓ EXPORT CSV
                        </button>
                    </div>
                    {/* ── Active alerts ── */}
                    <SubLabel>Active — last 3 hours</SubLabel>

                    {!hasActive ? (
                        <div style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.68rem', color: 'var(--muted)',
                            letterSpacing: '0.06em', padding: '0.4rem 0'
                        }}>
                            ✓ No active alerts
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[...activeAlerts]
                                .sort((a, b) => {
                                    const ai = SEV_ORDER.indexOf((a.severity || '').toUpperCase())
                                    const bi = SEV_ORDER.indexOf((b.severity || '').toUpperCase())
                                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
                                })
                                .map(alert => {
                                    const { bg, color } = sevStyle(alert.severity)
                                    return (
                                        <div key={alert.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.65rem',
                                            padding: '0.55rem 0.75rem', borderRadius: 8,
                                            background: bg, border: `1px solid ${color}33`,
                                            flexWrap: 'wrap',
                                        }}>
                                            <SevBadge severity={alert.severity} />
                                            <span style={{
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.65rem', fontWeight: 700, color,
                                            }}>
                                                {alert.alert_type}
                                            </span>
                                            <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text)', minWidth: '120px' }}>
                                                {alert.message}
                                            </span>
                                            <span style={{
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.7rem', fontWeight: 700, color, whiteSpace: 'nowrap'
                                            }}>
                                                {alert.value}
                                            </span>
                                            <span style={{
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.58rem', color: 'var(--muted)', whiteSpace: 'nowrap'
                                            }}>
                                                {formatDistanceToNow(parseISO(alert.alerted_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    )
                                })}
                        </div>
                    )}

                    {/* ── History table ── */}
                    <div style={{
                        padding: '0.85rem 0 0.45rem',
                    }}>
                        <span style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            color: 'var(--muted)'
                        }}>
                            History — last 14 days
                        </span>
                    </div>

                    {historyLoading ? (
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', color: 'var(--muted)', padding: '0.5rem 0' }}>
                            Loading history…
                        </div>
                    ) : total === 0 ? (
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', color: 'var(--muted)', padding: '0.4rem 0' }}>
                            No alerts recorded in the last 14 days
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr>
                                    {[
                                        { label: 'Date & Time', cls: '' },
                                        { label: 'Alert Type', cls: '' },
                                        { label: 'Severity', cls: '' },
                                        { label: 'Value', cls: '' },
                                        { label: 'Message', cls: 'alert-hist-message' },
                                    ].map(({ label, cls }) => (
                                        <th key={label} className={cls} style={{
                                            textAlign: 'left', padding: '0.4rem 0.6rem',
                                            fontFamily: "'Space Mono',monospace",
                                            fontSize: '0.55rem', fontWeight: 700,
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                            color: 'var(--muted)',
                                            borderBottom: '1px solid var(--border)',
                                            background: 'var(--bg)', // keeps header visible while scrolling
                                            position: 'sticky', top: 0, zIndex: 1,
                                        }}>
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(history || []).map((alert, idx) => (
                                    <tr key={alert.id} style={{
                                        borderBottom: idx < total - 1 ? '1px solid var(--border)' : 'none'
                                    }}>
                                        <td style={{
                                            padding: '0.45rem 0.6rem',
                                            fontFamily: "'Space Mono',monospace",
                                            fontSize: '0.63rem', color: 'var(--muted)', whiteSpace: 'nowrap'
                                        }}>
                                            {format(parseISO(alert.alerted_at), 'MMM d, yyyy HH:mm')}
                                        </td>
                                        <td style={{
                                            padding: '0.45rem 0.6rem',
                                            fontFamily: "'Space Mono',monospace",
                                            fontSize: '0.65rem', color: 'var(--text)'
                                        }}>
                                            {alert.alert_type}
                                        </td>
                                        <td style={{ padding: '0.45rem 0.6rem' }}>
                                            <SevBadge severity={alert.severity} />
                                        </td>
                                        <td style={{
                                            padding: '0.45rem 0.6rem',
                                            fontFamily: "'Space Mono',monospace",
                                            fontSize: '0.65rem', fontWeight: 700,
                                            color: 'var(--text-bright)'
                                        }}>
                                            {alert.value}
                                        </td>
                                        <td className="alert-hist-message" style={{
                                            padding: '0.45rem 0.6rem',
                                            fontSize: '0.72rem', color: 'var(--muted)'
                                        }}>
                                            {alert.message}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Row count footer */}
                    {total > 0 && (
                        <div style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '0.58rem', color: 'var(--muted)',
                            paddingTop: '0.65rem', marginTop: '0.5rem',
                            borderTop: '1px solid var(--border)',
                            textAlign: 'right'
                        }}>
                            {total} alert{total > 1 ? 's' : ''} total · scroll to view all
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}