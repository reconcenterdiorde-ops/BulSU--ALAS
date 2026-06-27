import { useState, useEffect } from 'react'
import { supabase, STATION_ID } from '../lib/supabase'

/**
 * Fetches alerts from the last 3 hours and subscribes to new ones.
 * Alerts older than 3 hours are considered expired and not shown.
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveAlerts() {
      // Only show alerts from the last 3 hours
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('station_id', STATION_ID)
        .gte('alerted_at', threeHoursAgo)
        .order('alerted_at', { ascending: false })

      if (!error && data) setAlerts(data)
      setLoading(false)
    }

    fetchActiveAlerts()

    // Real-time: prepend new alerts as they arrive
    const channel = supabase
      .channel('active-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `station_id=eq.${STATION_ID}`
        },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    // Refresh the 3-hour window every 15 minutes to expire old alerts
    const interval = setInterval(fetchActiveAlerts, 15 * 60 * 1000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  return { alerts, loading }
}