// Copy from Part 2
export const config = {
  // Google Integration (from PRD)
  googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby6XbPuA7XDjIbInBg8-CmBv1Ig7hy5-BuKq6q4ovSJfbDxz3JdkyK08Y9pUI4S2CiZ7A/exec',
  googleSheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '1fUHu5fb5Z77Aq4cAiK4Zybq-Dpgjf0xlzEDsxIgT9m8',
  googleDriveFolderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '1PBlW6ih36BSt47Ex4j4vbzEt-7XnGvX7',

  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // AI Configuration
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyChaQzjOaJqK9oz5OsmpCtWbTVpgdWDKxQ',

  // App Configuration
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 60 minutes
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB

  // 3D train model URL (Option A - CDN). Override with VITE_TRAIN_MODEL_URL.
  // Default points to a small sample GLB from the Khronos glTF Sample Models repo.
  trainModelUrl: import.meta.env.VITE_TRAIN_MODEL_URL || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb',

  // Roles
  roles: {
    ADMIN: 'Admin',
    OFFICER: 'Officer',
    ENGINEER: 'Engineer',
    TECHNICIAN: 'Technician'
  },

  status: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  }
};
