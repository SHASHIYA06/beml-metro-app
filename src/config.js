// Copy from Part 2
export const config = {
  // Google Integration (from PRD)
  // Web App URL for data operations (Section 2 of PRD)
  googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwC9YmAmXzwjkGAexhKfYW9_cE2XrXUtvRaxAwG_4Y0IHNCnBkxO8GjgkwWCwa6mwbU/exec',
  // Note: Section 1 URL seems to be for raw spreadsheet data or a different script, 
  // but usually the Web App URL is the main API. We'll use the Web App URL for API calls.

  googleSheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '1PBlW6ih36BSt47Ex4j4vbzEt-7XnGvX7', // Wait, PRD says Drive ID is this. Let's check Sheet ID.
  // PRD Item 1 "Google Drive ID: 1PBl..."
  // PRD Item 1 "Shared Folder...: 1PBl..."
  // PRD Item 1 "Google Spreadsheet URL...": script.google.com/... 
  // Actually PRD doesn't give a specific Sheet ID like "1fUHu...", it gives a Script URL.
  // But usually Sheet ID is needed if we access via API. 
  // However, if we use the Apps Script Web App, we might not need Sheet ID on frontend if script has it hardcoded.
  // Let's stick to the URL for now and update usage if needed.
  // The user provided "Google Drive ID" as "1PBl...".

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
