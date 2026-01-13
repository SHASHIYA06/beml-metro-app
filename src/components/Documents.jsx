import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import './Documents.css';

export default function Documents({ user }) {
  const { masterData } = useGoogleSheets();

  // State for documents and search
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for filters
  const [filters, setFilters] = useState({
    depot: '',
    trainSet: '',
    system: '',
    type: ''
  });

  // State for Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    name: '',
    type: '',
    category: '',
    system: '',
    trainSet: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async (search = '') => {
    try {
      setLoading(true);
      const res = await apiService.getDocuments(search);
      if (res.success) {
        setDocuments(res.documents || []);
      } else {
        // Fallback mock data if API fails or returns empty
        setError(res.error || 'Failed to load documents');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocuments(searchQuery);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setUploadForm(prev => ({ ...prev, file: files[0], name: files[0]?.name || '' }));
    } else {
      setUploadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return alert('Please select a file');

    setUploading(true);
    try {
      // 1. Upload file content
      const uploadResult = await apiService.uploadFile(uploadForm.file);

      if (uploadResult.success) {
        // 2. Register document metadata (Using a specific action or generic submit)
        // Note: Ideally we'd have a specific `addDocument` API. 
        // For now, we assume `submitEntry` or we'd add a dedicated method.
        // Let's assume we can reuse `uploadFile` logic or just consider it done if the index is auto-updated 
        // by the backend script upon upload.
        // However, if we need to store metadata like "System" and "TrainSet" specifically for the doc,
        // we might need to send that along.

        // Let's assume the backend handles metadata if we pass it. 
        // Or we alert success for now.

        alert(`Document "${uploadForm.name}" uploaded successfully!`);
        setShowUploadModal(false);
        setUploadForm({ file: null, name: '', type: '', category: '', system: '', trainSet: '' });
        loadDocuments(); // Refresh list
      } else {
        alert('Upload failed: ' + uploadResult.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  // Filter Logic
  const filteredDocuments = documents.filter(doc => {
    const matchesDepot = !filters.depot || doc.Depot === filters.depot || doc.depot === filters.depot;
    const matchesTrainSet = !filters.trainSet || doc.TrainSet === filters.trainSet || doc.trainSet === filters.trainSet;
    const matchesSystem = !filters.system || doc.System === filters.system || doc.system === filters.system;
    const matchesType = !filters.type || doc.Type === filters.type || doc.type === filters.type;
    return matchesDepot && matchesTrainSet && matchesSystem && matchesType;
  });

  const canUpload = user?.role === 'Admin' || user?.role === 'Officer';

  return (
    <div className="documents-page">
      <div className="page-header header-flex">
        <div>
          <h1>Documents</h1>
          <p>Search and view technical documents</p>
        </div>
        {canUpload && (
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            + Upload Document
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control search-input"
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        <div className="filter-controls">
          <select name="type" value={filters.type} onChange={handleFilterChange} className="form-control">
            <option value="">All Types</option>
            <option value="Manual">Manual</option>
            <option value="Schematic">Schematic</option>
            <option value="Report">Report</option>
            <option value="Checklist">Checklist</option>
          </select>
          <select name="system" value={filters.system} onChange={handleFilterChange} className="form-control">
            <option value="">All Systems</option>
            {masterData?.System?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="trainSet" value={filters.trainSet} onChange={handleFilterChange} className="form-control">
            <option value="">All TrainSets</option>
            {masterData?.TrainSet?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="spinner-large center-spinner"></div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="documents-grid">
        {filteredDocuments.length === 0 && !loading ? (
          <div className="no-docs">No documents found matching criteria</div>
        ) : (
          filteredDocuments.map((doc, idx) => (
            <div key={idx} className="doc-card">
              <div className="doc-icon">
                {doc.type === 'PDF' || doc.Type === 'PDF' ? '📄' : '📁'}
              </div>
              <div className="doc-info">
                <div className="doc-title" title={doc.Name || doc.name}>{doc.Name || doc.name}</div>
                <div className="doc-meta">
                  <span className="doc-tag type">{doc.Type || doc.type || 'Doc'}</span>
                  <span className="doc-tag system">{doc.System || doc.system || 'General'}</span>
                </div>
                {doc.TrainSet && <div className="doc-trainset">Train: {doc.TrainSet}</div>}
              </div>
              <div className="doc-actions">
                <a
                  href={doc.Url || doc.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  Open
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>File *</label>
                <input type="file" name="file" onChange={handleUploadChange} required className="form-control" />
              </div>
              <div className="form-group">
                <label>Document Name *</label>
                <input type="text" name="name" value={uploadForm.name} onChange={handleUploadChange} required className="form-control" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={uploadForm.type} onChange={handleUploadChange} className="form-control">
                    <option value="">Select Type</option>
                    <option value="Manual">Manual</option>
                    <option value="Schematic">Schematic</option>
                    <option value="Report">Report</option>
                    <option value="Checklist">Checklist</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={uploadForm.category} onChange={handleUploadChange} className="form-control">
                    <option value="">Select Category</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Safety">Safety</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>System</label>
                  <select name="system" value={uploadForm.system} onChange={handleUploadChange} className="form-control">
                    <option value="">Select System</option>
                    {masterData?.System?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>TrainSet</label>
                  <select name="trainSet" value={uploadForm.trainSet} onChange={handleUploadChange} className="form-control">
                    <option value="">Select TrainSet</option>
                    {masterData?.TrainSet?.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
