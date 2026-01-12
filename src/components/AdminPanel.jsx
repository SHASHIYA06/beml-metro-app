// Copy from Part 5
import React, { useState } from 'react';
import { apiService } from '../services/api';
import './AdminPanel.css';

export default function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ employeeId: '', name: '', password: '', role: 'Technician' });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddUser = async (e) => {
    e.preventDefault();
    const res = await apiService.addUser(form, user.id);
    if (res.success) setMessage('User added');
    else setMessage(res.error || 'Failed to add');
  };

  const handleDeleteUser = async (employeeId) => {
    if (!confirm(`Delete user ${employeeId}?`)) return;
    const res = await apiService.deleteUser(employeeId, user.id);
    if (res.success) setMessage('User deleted');
    else setMessage(res.error || 'Failed to delete');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>User management and system settings</p>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="admin-section">
        <h3>Add User</h3>
        <form onSubmit={handleAddUser} className="user-form">
          <input name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="Employee ID" required />
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="Admin">Admin</option>
            <option value="Officer">Officer</option>
            <option value="Engineer">Engineer</option>
            <option value="Technician">Technician</option>
          </select>
          <button className="btn btn-primary" type="submit">Add User</button>
        </form>
      </div>

      <div className="admin-section">
        <h3>Existing Users</h3>
        <p>Use Google Sheets to view and manage existing users (list endpoint is not implemented).</p>
      </div>
    </div>
  );
}
