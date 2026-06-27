import { useState, useEffect } from 'react'
import { supabase, STATION_ID } from '../lib/supabase'

// Fetch next 4 hourly forecasts from current time
export function useForecast() {
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchForecast() {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('station_id', STATION_ID)
        .gte('forecast_time', now)
        .order('forecast_time', { ascending: true })
        .limit(4)

      if (!error && data) setForecast(data)
      setLoading(false)
    }

    fetchForecast()
    // Refresh every 30 min — forecasts update every 4 hours so this is conservative
    const interval = setInterval(fetchForecast, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { forecast, loading }
}