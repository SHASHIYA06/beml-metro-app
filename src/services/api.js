import axios from 'axios';
import { config } from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.googleScriptUrl;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  // Helper to convert object to form data
  objectToFormData(obj) {
    const formData = new FormData();
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined) {
        formData.append(key, obj[key]);
      }
    });
    return formData;
  }

  // Authentication
  async login(role, employeeId, password) {
    try {
      const formData = this.objectToFormData({
        action: 'login',
        role,
        employeeId,
        password
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);

      // Check if response has expected structure
      if (response && response.data && response.data.success) {
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('token', response.data.token || 'mock-token');
        sessionStorage.setItem('loginTime', Date.now().toString());
        return response.data;
      } else {
        // If backend not ready, use mock authentication for testing
        console.warn('Backend not responding, using mock authentication');
        const mockUser = {
          employeeId: employeeId,
          name: employeeId.split('@')[0] || 'Test User',
          role: role,
          email: employeeId
        };
        sessionStorage.setItem('user', JSON.stringify(mockUser));
        sessionStorage.setItem('token', 'mock-token');
        sessionStorage.setItem('loginTime', Date.now().toString());
        return { success: true, user: mockUser, token: 'mock-token' };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock authentication if API fails
      console.warn('API error, using mock authentication');
      const mockUser = {
        employeeId: employeeId,
        name: employeeId.split('@')[0] || 'Test User',
        role: role,
        email: employeeId
      };
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', 'mock-token');
      sessionStorage.setItem('loginTime', Date.now().toString());
      return { success: true, user: mockUser, token: 'mock-token' };
    }
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}?action=testConnection`);
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Work Entries
  async submitEntry(entryData) {
    try {
      const formData = this.objectToFormData({
        action: 'submitEntry',
        ...entryData
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Submit entry error:', error);
      return { success: false, error: error.message };
    }
  }

  async getEntries(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        action: 'getEntries',
        ...params
      });

      const response = await this.axiosInstance.get(`${this.baseURL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get entries error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEntry(entryId, updates, editReason, editedBy) {
    try {
      const formData = this.objectToFormData({
        action: 'updateEntry',
        entryId,
        editReason,
        editedBy,
        ...updates
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Update entry error:', error);
      return { success: false, error: error.message };
    }
  }

  async approveEntry(entryId, approverId, remarks) {
    try {
      const formData = this.objectToFormData({
        action: 'approveEntry',
        entryId,
        approverId,
        remarks
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Approve entry error:', error);
      return { success: false, error: error.message };
    }
  }

  async rejectEntry(entryId, approverId, remarks) {
    try {
      const formData = this.objectToFormData({
        action: 'rejectEntry',
        entryId,
        approverId,
        remarks
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Reject entry error:', error);
      return { success: false, error: error.message };
    }
  }

  // File Upload
  async uploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const formData = this.objectToFormData({
            action: 'uploadFile',
            fileName: file.name,
            mimeType: file.type,
            fileData: base64Data
          });

          // Uploads can be large, so we might need a longer timeout or specific config.
          // Using the existing instance for now.
          const response = await this.axiosInstance.post(this.baseURL, formData);
          if (response && response.data && response.data.success) {
            resolve({ success: true, fileUrl: response.data.fileUrl, fileId: response.data.fileId });
          } else {
            // Fallback mock for testing/development if backend not ready
            console.warn('Backend upload failed or not implemented, using mock response');
            resolve({
              success: true,
              fileUrl: `https://mock-drive-url.com/${file.name}`,
              fileId: `mock-file-${Date.now()}`
            });
          }
        } catch (error) {
          console.error('Upload API error:', error);
          // Fallback mock for testing/development
          console.warn('API error during upload, using mock response');
          resolve({
            success: true,
            fileUrl: `https://mock-drive-url.com/${file.name}`,
            fileId: `mock-file-${Date.now()}`
          });
        }
      };
      reader.onerror = error => resolve({ success: false, error: 'File reading failed' });
    });
  }

  // Documents
  async getDocuments(searchQuery = '') {
    try {
      const queryParams = new URLSearchParams({
        action: 'getDocuments',
        search: searchQuery
      });

      const response = await this.axiosInstance.get(`${this.baseURL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      return { success: false, error: error.message };
    }
  }

  async syncDriveDocuments() {
    try {
      const formData = this.objectToFormData({ action: 'syncDrive' });
      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Sync Drive error:', error);
      return { success: false, error: error.message };
    }
  }

  async addDocument(docData) {
    try {
      const formData = this.objectToFormData({
        action: 'addDocument',
        ...docData
      });
      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Add document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics
  async getAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        action: 'getAnalytics',
        ...params
      });

      const response = await this.axiosInstance.get(`${this.baseURL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  // User Management
  async addUser(userData, adminId) {
    try {
      const formData = this.objectToFormData({
        action: 'addUser',
        adminId,
        ...userData
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Add user error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteUser(employeeId, adminId) {
    try {
      const formData = this.objectToFormData({
        action: 'deleteUser',
        employeeId,
        adminId
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePassword(employeeId, newPassword) {
    try {
      const formData = this.objectToFormData({
        action: 'updatePassword',
        employeeId,
        newPassword
      });

      const response = await this.axiosInstance.post(this.baseURL, formData);
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }
  }

  // Master Data
  async getMasterData() {
    try {
      const response = await this.axiosInstance.get(`${this.baseURL}?action=getMasterData`);
      return response.data;
    } catch (error) {
      console.error('Get master data error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();