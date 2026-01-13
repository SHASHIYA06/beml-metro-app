import React, { useState } from 'react'
import { apiService } from '../services/api'
import './Login.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Engineer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // 'login' or 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use Google Sheets API for authentication
      const result = await apiService.login(role, email, password)

      if (result.success && result.user) {
        const userData = {
          id: result.user.employeeId || email,
          email: email,
          name: result.user.name || email.split('@')[0],
          role: result.user.role || role
        }
        onLogin(userData)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>BEML Metro App</h1>
          <p>Maintenance & Document Intelligence Platform</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
            >
              <option value="Technician">Technician</option>
              <option value="Engineer">Engineer</option>
              <option value="Officer">Officer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email / Employee ID</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or employee ID"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="form-control"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>BEML/KMRCL Metro Operations Platform</p>
        </div>
      </div>
    </div>
  )
}
