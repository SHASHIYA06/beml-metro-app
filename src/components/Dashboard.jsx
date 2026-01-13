import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalEntries: 0,
    pendingApprovals: 0,
    recentDocuments: 0,
    myEntries: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard stats...');
      // Fetch real stats from Google Apps Script Backend
      const response = await apiService.getDashboardStats();
      console.log('Dashboard stats response:', response);

      if (response && response.success) {
        // SAFEGUARD: Ensure stats object exists to prevent crash
        const statsData = response.stats || {};

        setStats({
          totalEntries: statsData.totalEntries || 0,
          pendingApprovals: (user?.role === 'Officer' || user?.role === 'Admin') ? (statsData.pendingApprovals || 0) : 0,
          recentDocuments: statsData.recentDocuments || 0,
          myEntries: statsData.myEntries || 0
        });

        if (response.recentActivity && Array.isArray(response.recentActivity)) {
          setRecentActivity(response.recentActivity);
        } else {
          setRecentActivity([]);
        }
      } else {
        console.warn('Backend stats fetch failed or success=false', response?.error);
        setStats({ totalEntries: 0, pendingApprovals: 0, recentDocuments: 0, myEntries: 0 });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({ totalEntries: 0, pendingApprovals: 0, recentDocuments: 0, myEntries: 0 });
    } finally {
      setLoading(false);
    }
  }

  const getNavigationCards = () => {
    const baseCards = [
      {
        title: 'Work Entry',
        description: 'Submit new work entries',
        icon: '📝',
        link: '/work-entry',
        color: 'blue'
      },
      {
        title: 'My Entries',
        description: 'View your work history',
        icon: '📋',
        link: '/my-entries',
        color: 'green'
      },
      {
        title: 'Documents',
        description: 'Upload and search documents',
        icon: '📄',
        link: '/documents',
        color: 'purple'
      }
    ]

    if (user?.role === 'Officer' || user?.role === 'Admin') {
      baseCards.push({
        title: 'Supervisor',
        description: 'Review team entries',
        icon: '👥',
        link: '/supervisor',
        color: 'orange'
      })
    }

    if (user?.role === 'Admin') {
      baseCards.push({
        title: 'Admin Panel',
        description: 'Manage users and settings',
        icon: '⚙️',
        link: '/admin',
        color: 'red'
      })
    }

    return baseCards
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p className="role-badge">{user?.role || 'User'}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalEntries}</h3>
            <p>Total Entries</p>
          </div>
        </div>

        {(user?.role === 'Officer' || user?.role === 'Admin') && (
          <div className="stat-card highlight">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{stats.recentDocuments}</h3>
            <p>Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.myEntries}</h3>
            <p>My Entries</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="navigation-section">
        <h2>Quick Actions</h2>
        <div className="navigation-grid">
          {getNavigationCards().map((card) => (
            <Link
              key={card.link}
              to={card.link}
              className={`nav-card nav-card-${card.color}`}
            >
              <div className="nav-card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon activity-${activity.type}`}>
                  {activity.type === 'entry' && '📝'}
                  {activity.type === 'document' && '📄'}
                  {activity.type === 'approval' && '✅'}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
