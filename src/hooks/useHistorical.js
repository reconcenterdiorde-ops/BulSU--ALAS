import { useState, useEffect } from 'react'
import { supabase, STATION_ID } from '../lib/supabase'
import { subHours, subDays, format } from 'date-fns'

/**
 * Fetches historical weather data with adaptive resolution:
 *   24h  → raw observations (15-min intervals, ~96 rows)
 *   7d   → hourly summaries  (1-hr averages, ~168 rows)
 *   30d  → hourly summaries  (1-hr averages, ~720 rows)
 *
 * This keeps chart performance fast even for long ranges.
 */
export function useHistorical(timeRange = '24h') {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistorical() {
      setLoading(true)

      try {
        if (timeRange === '24h') {
          // Raw 15-minute observations for last 24 hours
          const from = subHours(new Date(), 24).toISOString()

          const { data: rows, error } = await supabase
            .from('observations')
            .select('recorded_at, temp, humidity, pressure, wind_avg_kmh, precip_qty, uv_index')
            .eq('station_id', STATION_ID)
            .gte('recorded_at', from)
            .order('recorded_at', { ascending: true })

          if (!error && rows) {
            setData(rows.map(r => ({
              time:     format(new Date(r.recorded_at), 'HH:mm'),
              fullTime: r.recorded_at,
              temp:     r.temp,
              humidity: r.humidity,
              pressure: r.pressure,
              wind:     r.wind_avg_kmh,
              rain:     r.precip_qty,
              uv:       r.uv_index
            })))
          }
        } else {
          // Hourly summaries for 7d or 30d
          const from = timeRange === '7d'
            ? subDays(new Date(), 7).toISOString()
            : subDays(new Date(), 30).toISOString()

          const { data: rows, error } = await supabase
            .from('hourly_summaries')
            .select('hour_start, avg_temp, avg_humidity, avg_pressure, avg_wind_kmh, total_precip, avg_uv')
            .eq('station_id', STATION_ID)
            .gte('hour_start', from)
            .order('hour_start', { ascending: true })

          if (!error && rows) {
            setData(rows.map(r => ({
              time:     format(new Date(r.hour_start), timeRange === '7d' ? 'MM/dd HH:mm' : 'MM/dd'),
              fullTime: r.hour_start,
              temp:     r.avg_temp,
              humidity: r.avg_humidity,
              pressure: r.avg_pressure,
              wind:     r.avg_wind_kmh,
              rain:     r.total_precip,
              uv:       r.avg_uv
            })))
          }
        }
      } catch (err) {
        console.error('Historical fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistorical()
  }, [timeRange])

  return { data, loading }
}
