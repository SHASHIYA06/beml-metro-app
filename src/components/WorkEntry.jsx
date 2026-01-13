import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { supabaseService } from '../services/supabase';
import './WorkEntry.css';

const WorkEntry = ({ user }) => {
  const { masterData, loading: masterDataLoading } = useGoogleSheets();
  const [formData, setFormData] = useState({
    employeeId: user.id,
    employeeName: user.name,
    depot: '',
    trainset: '',
    carNo: '',
    system: '',
    problem: '',
    actionTaken: '',
    remarks: '',
    fileAttachment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Upload files first (if any)
      const uploadedFileUrls = [];
      if (files.length > 0) {
        for (const file of files) {
          const uploadResult = await apiService.uploadFile(file);
          if (uploadResult.success && uploadResult.fileUrl) {
            uploadedFileUrls.push(uploadResult.fileUrl);
          } else {
            console.warn(`Failed to upload ${file.name}:`, uploadResult.error);
            // Optional: Show a warning but continue, or throw error to stop submission
          }
        }
      }

      // 2. Submit to Google Sheets
      const result = await apiService.submitEntry({
        EmpID: formData.employeeId,
        EmpName: formData.employeeName,
        Depot: formData.depot,
        TrainSet: formData.trainset,
        CarNo: formData.carNo,
        System: formData.system,
        Problem: formData.problem,
        ActionTaken: formData.actionTaken,
        Remarks: formData.remarks,
        // Attach links to the uploaded files
        fileAttachment: uploadedFileUrls.length > 0 ? uploadedFileUrls.join(', ') : ''
      });

      if (result.success) {
        // Backup to Supabase
        await supabaseService.backupEntry({
          entry_id: result.entryId,
          employee_id: formData.employeeId,
          employee_name: formData.employeeName,
          depot: formData.depot,
          trainset: formData.trainset,
          car_no: formData.carNo,
          system: formData.system,
          problem: formData.problem,
          action_taken: formData.actionTaken,
          remarks: formData.remarks,
          status: 'Pending',
          created_at: new Date().toISOString()
        });

        setSuccess(true);

        // Reset form
        setFormData({
          employeeId: user.id,
          employeeName: user.name,
          depot: '',
          trainset: '',
          carNo: '',
          system: '',
          problem: '',
          actionTaken: '',
          remarks: '',
          fileAttachment: ''
        });
        setFiles([]);

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Submission failed');
      }
    } catch (err) {
      setError('Error submitting entry. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (masterDataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="work-entry-page">
      <div className="page-header">
        <h1>Work Entry Form</h1>
        <p>Submit maintenance work details</p>
      </div>

      {success && (
        <div className="alert alert-success">
          ✓ Work entry submitted successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="work-entry-form">
        <div className="form-row">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              value={formData.employeeId}
              readOnly
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Employee Name</label>
            <input
              type="text"
              value={formData.employeeName}
              readOnly
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Depot *</label>
            <select
              name="depot"
              value={formData.depot}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">SELECT</option>
              {masterData?.Depot?.map(depot => (
                <option key={depot} value={depot}>{depot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>TrainSet *</label>
            <select
              name="trainset"
              value={formData.trainset}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">SELECT</option>
              {masterData?.TrainSet?.map(ts => (
                <option key={ts} value={ts}>{ts}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Car No *</label>
            <select
              name="carNo"
              value={formData.carNo}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">SELECT</option>
              {masterData?.CarNo?.map(car => (
                <option key={car} value={car}>{car}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>System *</label>
          <select
            name="system"
            value={formData.system}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">SELECT</option>
            {masterData?.System?.map(sys => (
              <option key={sys} value={sys}>{sys}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Problem Description *</label>
          <textarea
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            placeholder="Describe the problem..."
            required
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Action Taken *</label>
          <textarea
            name="actionTaken"
            value={formData.actionTaken}
            onChange={handleChange}
            placeholder="Describe the action taken..."
            required
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Additional remarks..."
            className="form-control"
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Attach Files (Optional)</label>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="form-control"
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <span key={index} className="file-tag">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Current Date and Time</label>
          <input
            type="text"
            value={getCurrentDateTime()}
            readOnly
            className="form-control"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'SUBMIT WORK ENTRY'}
        </button>
      </form>
    </div>
  );
};

export default WorkEntry;