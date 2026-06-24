import Header            from '../components/Header'
import AlertBanner       from '../components/AlertBanner'
import CurrentConditions from '../components/CurrentConditions'
import ForecastStrip     from '../components/ForecastStrip'
import HistoricalChart   from '../components/HistoricalChart'
import Footer            from '../components/Footer'

import { useLatestObservation } from '../hooks/useLatestObservation'
import { useAlerts }            from '../hooks/useAlerts'
import { useForecast }          from '../hooks/useForecast'

/**
 * Public dashboard page — the main view of BulSU-ALAS.
 * Combines all real-time and historical components.
 * No authentication required.
 */
export default function Dashboard() {
  const { observation, loading: obsLoading }     = useLatestObservation()
  const { alerts,      loading: alertsLoading }  = useAlerts()
  const { forecast,    loading: forecastLoading } = useForecast()

  return (
    <div className="page">
      <Header observation={observation} />

      <main className="content">

        {/* Active weather warnings — hidden when no alerts */}
        <AlertBanner
          alerts={alerts}
          loading={alertsLoading}
        />

        {/* All current sensor readings */}
        <CurrentConditions
          observation={observation}
          loading={obsLoading}
        />

        {/* 4-hour ahead forecast */}
        <ForecastStrip
          forecast={forecast}
          loading={forecastLoading}
        />

        {/* Interactive historical trends chart */}
        <HistoricalChart />

      </main>

      <Footer />
    </div>
  )
}
