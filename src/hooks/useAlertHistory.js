import { useState, useEffect } from 'react'
import { supabase, STATION_ID } from '../lib/supabase'

export function useAlertHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('station_id', STATION_ID)
        .gte('alerted_at', from)
        .order('alerted_at', { ascending: false })

      if (!error && data) setHistory(data)
      setLoading(false)
    }

    fetchHistory()

    const channel = supabase
      .channel('alert-history')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'alerts',
        filter: `station_id=eq.${STATION_ID}`
      }, payload => {
        setHistory(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { history, loading }
}