import { useState, useEffect } from 'react'
import { supabase, STATION_ID } from '../lib/supabase'

/**
 * Fetches the latest observation and subscribes to real-time inserts.
 * The component using this hook will re-render automatically
 * every time a new 15-minute observation arrives.
 */
export function useLatestObservation() {
  const [observation, setObservation] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  useEffect(() => {
    // 1. Initial fetch — get the most recent row immediately
    async function fetchLatest() {
      try {
        const { data, error } = await supabase
          .from('observations')
          .select('*')
          .eq('station_id', STATION_ID)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error
        setObservation(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLatest()

    // 2. Real-time subscription — fires on every new INSERT
    // This is what makes the dashboard "live" without page refreshes
    const channel = supabase
      .channel('latest-observation')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'observations',
          filter: `station_id=eq.${STATION_ID}`
        },
        (payload) => {
          setObservation(payload.new)
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts
    return () => supabase.removeChannel(channel)
  }, [])

  return { observation, loading, error }
}
