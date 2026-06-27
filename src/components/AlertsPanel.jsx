import { useState, useRef } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

const SEV_ORDER = [
    'EXTREME', 'INTENSE', 'SEVERE', 'DANGER',
    'VERY HIGH', 'HIGH', 'ALERT',
    'MODERATE', 'CAUTION', 'HEAVY', 'LOW'
]

const PAGE_SIZE = 10

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
    const [page, setPage] = useState(0)
    const panelRef = useRef(null)

    const hasActive = activeAlerts && activeAlerts.length > 0
    const total = history?.length || 0
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paged = (history || []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

    // Allow parent PersistentBanner's "+N more" to open this panel
    // by exposing expand() via ref — handled by Dashboard passing a callback instead
    function handleToggle() {
        setExpanded(e => !e)
        setPage(0)
    }

    function handleExpand() {
        setExpanded(true)
        setPage(0)
        setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    // Expose handleExpand via DOM for PersistentBanner's "view all" link
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
            {/* ── Header ── */}
            <div
                onClick={handleToggle}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 1.1rem',
                    background: 'var(--surface)',
                    cursor: 'pointer', userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                    transform: expanded ? 'rotate(180deg)' : 'none'
                }}>▼</span>
            </div>

            {/* ── Expanded body ── */}
            {expanded && (
                <div style={{ background: 'var(--bg)', padding: '0 1.1rem 1.1rem' }}>

                    {/* Active alerts */}
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
                                            background: bg, border: `1px solid ${color}33`
                                        }}>
                                            <SevBadge severity={alert.severity} />
                                            <span style={{
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.65rem', fontWeight: 700, color,
                                            }}>
                                                {alert.alert_type}
                                            </span>
                                            <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text)' }}>
                                                {alert.message}
                                            </span>
                                            <span style={{
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.7rem', fontWeight: 700, color,
                                                whiteSpace: 'nowrap'
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

                    {/* History */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderTop: '1px solid var(--border)', marginTop: '0.9rem',
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
                        <button
                            onClick={e => { e.stopPropagation(); exportCSV(history) }}
                            style={{
                                fontFamily: "'Space Mono',monospace",
                                fontSize: '0.6rem', fontWeight: 700,
                                color: 'var(--accent)', border: '1px solid var(--accent)',
                                background: 'transparent', padding: '0.2rem 0.65rem',
                                borderRadius: 6, cursor: 'pointer', letterSpacing: '0.06em',
                            }}
                        >
                            ↓ EXPORT CSV
                        </button>
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
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                <thead>
                                    <tr>
                                        {['Date & Time', 'Alert Type', 'Severity', 'Value', 'Message'].map(h => (
                                            <th key={h} style={{
                                                textAlign: 'left', padding: '0.4rem 0.6rem',
                                                fontFamily: "'Space Mono',monospace",
                                                fontSize: '0.55rem', fontWeight: 700,
                                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                                color: 'var(--muted)',
                                                borderBottom: '1px solid var(--border)'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paged.map((alert, idx) => (
                                        <tr key={alert.id} style={{
                                            borderBottom: idx < paged.length - 1 ? '1px solid var(--border)' : 'none'
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
                                            <td style={{
                                                padding: '0.45rem 0.6rem',
                                                fontSize: '0.72rem', color: 'var(--muted)'
                                            }}>
                                                {alert.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '0.75rem', paddingTop: '0.65rem',
                                    borderTop: '1px solid var(--border)'
                                }}>
                                    <span style={{
                                        fontFamily: "'Space Mono',monospace",
                                        fontSize: '0.6rem', color: 'var(--muted)'
                                    }}>
                                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {[['← Prev', page === 0, () => setPage(p => p - 1)],
                                        ['Next →', page >= totalPages - 1, () => setPage(p => p + 1)]
                                        ].map(([label, disabled, onClick]) => (
                                            <button
                                                key={label}
                                                onClick={e => { e.stopPropagation(); onClick() }}
                                                disabled={disabled}
                                                style={{
                                                    fontFamily: "'Space Mono',monospace",
                                                    fontSize: '0.6rem', padding: '0.2rem 0.65rem',
                                                    borderRadius: 6, border: '1px solid var(--border)',
                                                    background: 'var(--surface)',
                                                    color: disabled ? 'var(--muted)' : 'var(--text)',
                                                    cursor: disabled ? 'default' : 'pointer',
                                                    opacity: disabled ? 0.5 : 1,
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}