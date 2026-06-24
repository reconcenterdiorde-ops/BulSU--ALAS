import { format, parseISO } from 'date-fns'

/**
 * Shows the next 4 hourly forecasts from Open-Meteo.
 * Displays temperature, rain probability, and cloud cover per hour.
 */

function cloudIcon(cloudCover) {
  if (cloudCover <= 20)  return '☀️'
  if (cloudCover <= 50)  return '🌤️'
  if (cloudCover <= 80)  return '🌥️'
  return '☁️'
}

function rainIcon(prob) {
  if (prob >= 70) return '🌧️'
  if (prob >= 40) return '🌦️'
  return null
}

export default function ForecastStrip({ forecast, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-title">4-Hour Forecast</div>
        <div className="forecast-strip">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="forecast-item">
              <div className="skeleton" style={{ width: '60%', margin: '0 auto .5rem' }} />
              <div className="skeleton" style={{ width: '40%', height: '2rem', margin: '0 auto .5rem' }} />
              <div className="skeleton" style={{ width: '70%', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (forecast.length === 0) {
    return (
      <div className="card">
        <div className="card-title">4-Hour Forecast</div>
        <div className="loading">No forecast data available</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">4-Hour Forecast · Open-Meteo NWP Model</div>
      <div className="forecast-strip">
        {forecast.map((item, i) => {
          const time       = format(parseISO(item.forecast_time), 'h:mm a')
          const icon       = rainIcon(item.precip_prob) || cloudIcon(item.cloud_cover)
          const isNextHour = i === 0

          return (
            <div
              key={item.id}
              className="forecast-item"
              style={isNextHour ? { borderColor: '#bae6fd', background: '#f0f9ff' } : {}}
            >
              <div className="forecast-time">{isNextHour ? 'Next hour' : time}</div>
              <div className="forecast-icon">{icon}</div>
              <div className="forecast-temp">{Number(item.temp).toFixed(1)}°C</div>
              <div className="forecast-rain">💧 {item.precip_prob}%</div>
              <div className="forecast-cloud">☁ {item.cloud_cover}% cloud</div>
              {item.precip_amt > 0 && (
                <div className="forecast-cloud">{Number(item.precip_amt).toFixed(1)} mm</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
