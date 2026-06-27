import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import './index.css'

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('alas-theme') || 'dark'
  )

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('alas-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}