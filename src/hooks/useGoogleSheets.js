import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Default master data from PRD
const DEFAULT_MASTER_DATA = {
  Depot: ['KMRCL', 'BMRCL', 'DMRCL', 'MMRCL'],
  TrainSet: ['TS01', 'TS02', 'TS03', 'TS04', 'TS05', 'TS06', 'TS07', 'TS08', 'TS09', 'TS10', 'TS11', 'TS12', 'TS13', 'TS14', 'TS15', 'TS16', 'TS17'],
  CarNo: ['ALL CARS', 'DMC1', 'TC1', 'MC1', 'MC2', 'TC2', 'DMC2'],
  System: [
    'General',
    'Train',
    'Vehicle Structure & Interior Fitting',
    'Bogie & Suspension',
    'Gangway & Coupler',
    'Traction System',
    'Brake System',
    'Auxiliary Electric System',
    'Door System',
    'Air Conditioning System',
    'Train Integrated Management System',
    'Communication System',
    'Fire Detection System',
    'Lightning System',
    'Vehicle Control System'
  ]
};

export function useGoogleSheets() {
  const [masterData, setMasterData] = useState(DEFAULT_MASTER_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.getMasterData();

      if (result.success && result.masterData) {
        setMasterData(result.masterData);
      }
      // If API fails, keep using default values
    } catch (err) {
      console.error('Error loading master data:', err);
      setError(err.message);
      // Keep using default values
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
