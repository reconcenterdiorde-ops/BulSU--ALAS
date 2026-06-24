import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import './index.css'

/**
 * Root application router.
 * Currently routes:
 *   /          → public dashboard
 *
 * Admin routes (Supabase Auth protected) will be added in the next phase:
 *   /admin     → admin login + CSV export + alert acknowledgment
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<Dashboard />} />
        {/* Catch-all: redirect unknown paths to dashboard */}
        <Route path="*"  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
