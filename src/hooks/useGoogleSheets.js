import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function useGoogleSheets() {
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.getMasterData();
      
      if (result.success) {
        setMasterData(result.masterData);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      const result = await apiService.testConnection();
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return { masterData, loading, error, loadMasterData, testConnection };
}
