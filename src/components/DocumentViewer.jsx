// Copy from Part 5
import React from 'react';
import './DocumentViewer.css';

export default function DocumentViewer({ url, fileName }) {
  if (!url) {
    return <div className="doc-viewer-empty">No document selected</div>;
  }

  const isPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{fileName || 'Document'}</h3>
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-link">Open in new tab</a>
      </div>

      <div className="viewer-body">
        {isPDF ? (
          <iframe src={url} title={fileName} className="pdf-frame" />
        ) : (
          <img src={url} alt={fileName} className="doc-image" />
        )}
      </div>
    </div>
  );
}
