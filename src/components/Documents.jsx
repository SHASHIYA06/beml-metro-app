// Copy from Part 5
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Documents.css';

export default function Documents() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async (search = '') => {
    try {
      setLoading(true);
      const res = await apiService.getDocuments(search);
      if (res.success) setDocuments(res.documents || []);
      else setError(res.error || 'Failed to load documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocuments(query);
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>Documents</h1>
        <p>Search and view documents from Drive</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search documents by name, type, or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-primary" type="submit">Search</button>
        <button type="button" className="btn btn-secondary" onClick={() => loadDocuments('')}>Clear</button>
      </form>

      {loading && <div className="spinner">Loading...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="no-docs">No documents found</div>
        ) : (
          documents.map((doc, idx) => (
            <div key={idx} className="doc-card">
              <div className="doc-title">{doc.Name || doc.name}</div>
              <div className="doc-meta">Type: {doc.Type || doc.type} • Category: {doc.Category || doc.category}</div>
              <div className="doc-actions">
                <a href={doc.Url || doc.Url || '#'} target="_blank" rel="noreferrer" className="btn btn-link">Open</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
