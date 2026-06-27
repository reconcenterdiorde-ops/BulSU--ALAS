import Header from '../components/Header'
import PersistentBanner from '../components/PersistentBanner'
import AlertsPanel from '../components/AlertsPanel'
import CurrentConditions from '../components/CurrentConditions'
import ForecastStrip from '../components/ForecastStrip'
import HistoricalChart from '../components/HistoricalChart'
import Footer from '../components/Footer'

import { useLatestObservation } from '../hooks/useLatestObservation'
import { useAlerts } from '../hooks/useAlerts'
import { useForecast } from '../hooks/useForecast'
import { useAlertHistory } from '../hooks/useAlertHistory'

export default function Dashboard({ theme, toggleTheme }) {
  const { observation, loading: obsLoading } = useLatestObservation()
  const { alerts, loading: alertsLoading } = useAlerts()
  const { forecast, loading: forecastLoading } = useForecast()
  const { history, loading: historyLoading } = useAlertHistory()

  // "+N more" link in PersistentBanner opens the AlertsPanel
  function handleViewAll() {
    if (typeof window !== 'undefined' && window.__alertsPanelExpand) {
      window.__alertsPanelExpand()
    }
  }

  return (
    <div className="wrapper">
      <Header
        observation={observation}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Layer 1 — persistent banner (all severities, duration-based) */}
      {!alertsLoading && (
        <PersistentBanner
          alerts={alerts}
          onViewAll={handleViewAll}
        />
      )}

      {/* Layer 2 — collapsible alerts panel (active + 14-day history) */}
      <AlertsPanel
        activeAlerts={alerts || []}
        history={history}
        historyLoading={historyLoading}
      />

      {/* Bento grid — current conditions */}
      <div className="section-title">CURRENT CONDITIONS</div>
      <CurrentConditions observation={observation} loading={obsLoading} />

      {/* 4-hour forecast */}
      <ForecastStrip forecast={forecast} loading={forecastLoading} />

      {/* Historical trends */}
      <HistoricalChart />

      <Footer />
    </div>
  )
}