// Copy from Part 2
export const config = {
  googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL,
  googleSheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
  googleDriveFolderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'),

  // 3D train model URL (Option A - CDN). Override with VITE_TRAIN_MODEL_URL.
  // Default points to a small sample GLB from the Khronos glTF Sample Models repo.
  trainModelUrl: import.meta.env.VITE_TRAIN_MODEL_URL || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb',
  
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
