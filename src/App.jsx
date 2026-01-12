import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import WorkEntry from './components/WorkEntry'
import MyEntries from './components/MyEntries'
import Documents from './components/Documents'
import SupervisorDashboard from './components/SupervisorDashboard'
import AdminPanel from './components/AdminPanel'
import VoiceAgent from './components/VoiceAgent'
import Train3D from './components/Train3D'
import { useAuth } from './hooks/useAuth'
import './index.css'

export default function App() {
  const { user, loading, login, logout } = useAuth()
  const [showVoiceAgent, setShowVoiceAgent] = useState(false)

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading BEML Metro Platform...</p>
      </div>
    </div>
  )

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {user && (
          <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="logo" className="h-10" />
              <div>
                <h1 className="text-lg font-semibold">BEML Metro Operations Platform</h1>
                <p className="text-sm text-gray-500">Operations Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Train3D modelUrl={process.env.VITE_TRAIN_MODEL_URL || '/models/train.glb'} size={120} />

              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setShowVoiceAgent(s => !s)}>🎤</button>

              <div className="text-right">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>

              <button className="px-3 py-2 rounded border" onClick={logout}>Logout</button>
            </div>
          </header>
        )}

        <main className="p-6">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/work-entry" element={user ? <WorkEntry user={user} /> : <Navigate to="/login" />} />
            <Route path="/my-entries" element={user ? <MyEntries user={user} /> : <Navigate to="/login" />} />
            <Route path="/documents" element={user ? <Documents user={user} /> : <Navigate to="/login" />} />
            <Route path="/supervisor" element={user && (user.role === 'Officer' || user.role === 'Admin') ? <SupervisorDashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/admin" element={user && user.role === 'Admin' ? <AdminPanel user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>

        {showVoiceAgent && <div className="fixed right-6 bottom-6"><VoiceAgent onClose={() => setShowVoiceAgent(false)} /></div>}

        <footer className="p-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} BEML Metro — Created by Shashi Shekhar Mishra</footer>
      </div>
    </Router>
  )
}
