// Copy from Part 5
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './SupervisorDashboard.css';

export default function SupervisorDashboard({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await apiService.getEntries({ days: 30 });
      if (res.success) setEntries(res.entries || []);
    } catch (err) {
      console.error('Load entries error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entryId) => {
    const res = await apiService.approveEntry(entryId, user.id, 'Approved via supervisor panel');
    if (res.success) loadEntries();
  };

  const handleReject = async (entryId) => {
    const remark = prompt('Enter rejection reason') || '';
    const res = await apiService.rejectEntry(entryId, user.id, remark);
    if (res.success) loadEntries();
  };

  return (
    <div className="supervisor-page">
      <div className="page-header">
        <h1>Supervisor Dashboard</h1>
        <p>Approve or reject work entries</p>
      </div>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="no-data">No entries found</div>
          ) : (
            entries.map((e, idx) => (
              <div key={idx} className="entry-row">
                <div className="entry-info">
                  <div className="entry-meta">{new Date(e.CurrentDateTime).toLocaleString()}</div>
                  <div className="entry-title">{e.EmpName} — {e.TrainSet} — {e.System}</div>
                  <div className="entry-problem">{e.Problem}</div>
                  <div className="entry-remarks">{e.Remarks}</div>
                </div>
                <div className="entry-actions">
                  <button className="btn btn-approve" onClick={() => handleApprove(e.EntryID)}>Approve</button>
                  <button className="btn btn-reject" onClick={() => handleReject(e.EntryID)}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
