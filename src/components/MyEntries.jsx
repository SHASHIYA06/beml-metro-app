import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './MyEntries.css';

const MyEntries = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editReason, setEditReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [user.id]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Fetch last 7 days of entries for the current user
      const result = await apiService.getEntries({
        employeeId: user.id,
        days: 7
      });

      if (result.success) {
        setEntries(result.data || []);
      } else {
        // Fallback or empty state if API fails
        setEntries([]);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load recent entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setEditForm({ ...entry });
    setEditReason('');
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editReason.trim()) {
      alert('Please provide a reason for editing.');
      return;
    }

    setSaving(true);
    try {
      const result = await apiService.updateEntry(
        editingEntry.entryId,
        editForm,
        editReason,
        user.name
      );

      if (result.success) {
        setShowEditModal(false);
        fetchEntries(); // Refresh list
        alert('Entry updated successfully.');
      } else {
        alert(result.error || 'Failed to update entry.');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('An error occurred while updating.');
    } finally {
      setSaving(false);
    }
  };

  const isEditable = (entry) => {
    // Logic: Editable if status is not Approved and within 7 days
    if (entry.status === 'Approved') return false;

    const entryDate = new Date(entry.createdAt || entry.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return entryDate > sevenDaysAgo;
  };

  if (loading) return <div className="loading">Loading entries...</div>;

  return (
    <div className="my-entries-container">
      <div className="page-header">
        <h1>My Recent Entries (Last 7 Days)</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="entries-table-container">
        {entries.length === 0 ? (
          <p className="no-entries">No recent entries found.</p>
        ) : (
          <table className="entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Depot</th>
                <th>TrainSet</th>
                <th>Car No</th>
                <th>System</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.entryId} className={`status-${entry.status?.toLowerCase()}`}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.depot}</td>
                  <td>{entry.trainSet}</td>
                  <td>{entry.carNo}</td>
                  <td>{entry.system}</td>
                  <td className="truncate-text" title={entry.problem}>{entry.problem}</td>
                  <td>
                    <span className={`status-badge ${entry.status?.toLowerCase()}`}>
                      {entry.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {isEditable(entry) && (
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEditClick(entry)}
                        title="Edit Entry"
                      >
                        ✏️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Work Entry</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Problem Description</label>
                <textarea
                  name="problem"
                  value={editForm.problem}
                  onChange={handleEditChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Action Taken</label>
                <textarea
                  name="actionTaken"
                  value={editForm.actionTaken}
                  onChange={handleEditChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={editForm.remarks}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>
              <div className="form-group reason-group">
                <label>Reason for Edit *</label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Why are you changing this record?"
                  required
                  className="form-control"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEntries;
