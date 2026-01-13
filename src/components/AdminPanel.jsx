import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { config } from '../config';
import './AdminPanel.css';

export default function AdminPanel({ user }) {
  const [activeTab, setActiveTab] = useState('users'); // users, config, backup

  // User Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userForm, setUserForm] = useState({ employeeId: '', name: '', password: '', role: 'Technician' });

  // Config Management State
  const [settings, setSettings] = useState({
    scriptUrl: apiService.baseURL,
    driveFolderId: config.googleDriveFolderId,
    sheetId: config.googleSheetId
  });

  // Backup Settings State (Supabase)
  const [backupSettings, setBackupSettings] = useState({
    supabaseUrl: localStorage.getItem('SUPABASE_URL') || config.supabaseUrl,
    supabaseKey: localStorage.getItem('SUPABASE_KEY') || config.supabaseAnonKey
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- User Management ---
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiService.getUsers();
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const res = await apiService.addUser(userForm, user.id);
    if (res.success) {
      showMessage('success', 'User added successfully');
      setUserForm({ employeeId: '', name: '', password: '', role: 'Technician' });
      loadUsers();
    } else {
      showMessage('error', res.error || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (empId) => {
    if (!window.confirm(`Are you sure you want to delete user ${empId}?`)) return;
    const res = await apiService.deleteUser(empId, user.id);
    if (res.success) {
      showMessage('success', 'User deleted');
      loadUsers();
    } else {
      showMessage('error', res.error || 'Failed to delete user');
    }
  };

  // --- Config Management ---
  const handleConfigSave = (e) => {
    e.preventDefault();
    apiService.updateBaseURL(settings.scriptUrl);
    // Ideally we'd update other configs too, but config.js is read-only. 
    // We can simulate it via localStorage or just API URL which is critical.
    localStorage.setItem('GOOGLE_DRIVE_FOLDER_ID', settings.driveFolderId);
    showMessage('success', 'System configuration updated (Saved to browser storage)');
  };

  // --- Backup Settings ---
  const handleBackupSave = (e) => {
    e.preventDefault();
    localStorage.setItem('SUPABASE_URL', backupSettings.supabaseUrl);
    localStorage.setItem('SUPABASE_KEY', backupSettings.supabaseKey);
    showMessage('success', 'Backup settings saved locally');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>Manage users, system configuration, and backups</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          System Config
        </button>
        <button
          className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          Database & Backup
        </button>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="card">
            <h3>Add New User</h3>
            <form onSubmit={handleUserSubmit} className="admin-form">
              <div className="form-group">
                <input
                  name="employeeId"
                  className="form-control"
                  placeholder="Employee ID (Login ID)"
                  value={userForm.employeeId}
                  onChange={e => setUserForm({ ...userForm, employeeId: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  name="name"
                  className="form-control"
                  placeholder="Full Name"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  type="password"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <select
                  name="role"
                  className="form-control"
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="Technician">Technician</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Officer">Officer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Create User</button>
            </form>
          </div>

          <div className="card mt-4">
            <h3>Existing Users</h3>
            {loadingUsers ? <p>Loading users...</p> : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map(u => (
                      <tr key={u.employeeId}>
                        <td>{u.employeeId}</td>
                        <td>{u.name}</td>
                        <td>{u.role}</td>
                        <td>
                          {u.employeeId !== user.employeeId && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.employeeId)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No users found or backend not connected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="tab-content">
          <div className="card">
            <h3>Google Integration Settings</h3>
            <p className="hint-text">Caution: Changing these URLs effectively points the app to a different backend.</p>
            <form onSubmit={handleConfigSave} className="admin-form">
              <div className="form-group">
                <label>Google Apps Script Web App URL</label>
                <input
                  className="form-control"
                  type="text"
                  value={settings.scriptUrl}
                  onChange={e => setSettings({ ...settings, scriptUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Google Drive Folder ID (for uploads)</label>
                <input
                  className="form-control"
                  type="text"
                  value={settings.driveFolderId}
                  onChange={e => setSettings({ ...settings, driveFolderId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Google Sheet ID</label>
                <input
                  className="form-control"
                  type="text"
                  value={settings.sheetId}
                  onChange={e => setSettings({ ...settings, sheetId: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-warning">Save Configuration</button>
            </form>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="tab-content">
          <div className="card">
            <h3>Database & Backup (Supabase)</h3>
            <p className="hint-text">Configure a secondary database for data redundancy.</p>
            <form onSubmit={handleBackupSave} className="admin-form">
              <div className="form-group">
                <label>Supabase URL</label>
                <input
                  className="form-control"
                  value={backupSettings.supabaseUrl}
                  onChange={e => setBackupSettings({ ...backupSettings, supabaseUrl: e.target.value })}
                  placeholder="https://xyz.supabase.co"
                />
              </div>
              <div className="form-group">
                <label>Supabase Anon Key</label>
                <input
                  className="form-control"
                  type="password"
                  value={backupSettings.supabaseKey}
                  onChange={e => setBackupSettings({ ...backupSettings, supabaseKey: e.target.value })}
                  placeholder="public-anon-key"
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Backup Settings</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
