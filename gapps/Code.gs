// ============================================
// BEML METRO WORK ENTRY - GOOGLE APPS SCRIPT
// Updated: January 2026
// ============================================

const SHEET_ID = '1fUHu5fb5Z77Aq4cAiK4Zybq-Dpgjf0xlzEDsxIgT9m8';
const DRIVE_FOLDER_ID = '1PBlW6ih36BSt47Ex4j4vbzEt-7XnGvX7';
const ADMIN_PASSCODE = '9799494321';

// Sheet Names
const SHEETS = {
  USERS: 'Users',
  ENTRIES: 'Entries',
  EDITS_LOG: 'Edits_Log',
  APPROVALS: 'Approvals',
  AUDIT_LOG: 'Audit_Log',
  DOCUMENTS_INDEX: 'Documents_Index',
  MASTER_DATA: 'Master_Data'
};

// ============================================
// MAIN HANDLERS
// ============================================

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getEntries':
        return getEntries(e.parameter);
      case 'getDocuments':
        return getDocuments(e.parameter);
      case 'getAnalytics':
        return getAnalytics(e.parameter);
      case 'getMasterData':
        return getMasterData();
      case 'testConnection':
        return testConnection();
      default:
        return getAllEntries();
    }
  } catch(error) {
    return createResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'login':
        return authenticateUser(e.parameter);
      case 'submitEntry':
        return submitEntry(e.parameter);
      case 'updateEntry':
        return updateEntry(e.parameter);
      case 'approveEntry':
        return approveEntry(e.parameter);
      case 'rejectEntry':
        return rejectEntry(e.parameter);
      case 'addUser':
        return addUser(e.parameter);
      case 'deleteUser':
        return deleteUser(e.parameter);
      case 'updatePassword':
        return updatePassword(e.parameter);
      case 'uploadDocument':
        return uploadDocument(e.parameter);
      case 'syncDrive':
        return syncDriveDocuments();
      default:
        return submitEntry(e.parameter);
    }
  } catch(error) {
    return createResponse({ success: false, error: error.toString() });
  }
}

// ============================================
// AUTHENTICATION
// ============================================

function authenticateUser(params) {
  const { role, employeeId, password } = params;
  
  // Admin login
  if (role === 'Admin' && password === ADMIN_PASSCODE) {
    logAudit('LOGIN', 'ADMIN', 'Admin login successful');
    return createResponse({
      success: true,
      user: { role: 'Admin', name: 'Administrator', id: 'ADMIN' },
      token: generateToken('ADMIN', 'Admin')
    });
  }
  
  // Regular user login
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  const users = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < users.length; i++) {
    const [id, name, pwd, userRole] = users[i];
    
    if (id === employeeId && pwd === password && userRole === role) {
      logAudit('LOGIN', employeeId, `${name} logged in as ${role}`);
      return createResponse({
        success: true,
        user: { id, name, role: userRole },
        token: generateToken(id, userRole)
      });
    }
  }
  
  return createResponse({ success: false, error: 'Invalid credentials' });
}

// ============================================
// WORK ENTRY OPERATIONS
// ============================================

function submitEntry(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const entriesSheet = ss.getSheetByName(SHEETS.ENTRIES);
  
  const timestamp = new Date();
  const entryId = 'ENT' + timestamp.getTime();
  
  const row = [
    entryId,
    params.EmpID || params.employeeId,
    params.EmpName || params.employeeName,
    params.Depot || params.depot,
    params.TrainSet || params.trainset,
    params.CarNo || params.carNo,
    params.System || params.system,
    params.Problem || params.problem,
    params.ActionTaken || params.actionTaken,
    params.Remarks || params.remarks,
    timestamp,
    'Pending',
    params.fileAttachment || '',
    ''
  ];
  
  entriesSheet.appendRow(row);
  
  logAudit('SUBMIT', params.EmpID || params.employeeId, `New entry: ${entryId}`);
  
  return createResponse({
    success: true,
    entryId: entryId,
    message: 'Entry submitted successfully'
  });
}

function getEntries(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const entriesSheet = ss.getSheetByName(SHEETS.ENTRIES);
  const data = entriesSheet.getDataRange().getValues();
  
  const headers = data[0];
  const entries = [];
  
  for (let i = 1; i < data.length; i++) {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = data[i][index];
    });
    
    // Filter by employee if specified
    if (params.employeeId && entry.EmpID !== params.employeeId) {
      continue;
    }
    
    // Filter by date range (last 7 days if specified)
    if (params.days) {
      const entryDate = new Date(entry.CurrentDateTime);
      const daysDiff = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > parseInt(params.days)) {
        continue;
      }
    }
    
    entries.push(entry);
  }
  
  return createResponse({ success: true, entries });
}

function updateEntry(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const entriesSheet = ss.getSheetByName(SHEETS.ENTRIES);
  const editsSheet = ss.getSheetByName(SHEETS.EDITS_LOG);
  
  const data = entriesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.entryId) {
      // Check if editable (≤7 days and not approved)
      const entryDate = new Date(data[i][10]);
      const daysDiff = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7 || data[i][11] === 'Approved') {
        return createResponse({ success: false, error: 'Entry cannot be edited' });
      }
      
      // Log original data
      editsSheet.appendRow([
        params.entryId,
        new Date(),
        params.editReason,
        params.editedBy,
        JSON.stringify(data[i])
      ]);
      
      // Update entry
      entriesSheet.getRange(i + 1, 8).setValue(params.problem);
      entriesSheet.getRange(i + 1, 9).setValue(params.actionTaken);
      entriesSheet.getRange(i + 1, 10).setValue(params.remarks);
      
      logAudit('EDIT', params.editedBy, `Entry ${params.entryId} edited`);
      
      return createResponse({ success: true, message: 'Entry updated successfully' });
    }
  }
  
  return createResponse({ success: false, error: 'Entry not found' });
}

function approveEntry(params) {
  return changeEntryStatus(params, 'Approved');
}

function rejectEntry(params) {
  return changeEntryStatus(params, 'Rejected');
}

function changeEntryStatus(params, status) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const entriesSheet = ss.getSheetByName(SHEETS.ENTRIES);
  const approvalsSheet = ss.getSheetByName(SHEETS.APPROVALS);
  
  const data = entriesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.entryId) {
      entriesSheet.getRange(i + 1, 12).setValue(status);
      
      approvalsSheet.appendRow([
        params.entryId,
        new Date(),
        params.approverId,
        status,
        params.remarks || ''
      ]);
      
      logAudit(status.toUpperCase(), params.approverId, `Entry ${params.entryId} ${status.toLowerCase()}`);
      
      return createResponse({ success: true, message: `Entry ${status.toLowerCase()} successfully` });
    }
  }
  
  return createResponse({ success: false, error: 'Entry not found' });
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function syncDriveDocuments() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const docsSheet = ss.getSheetByName(SHEETS.DOCUMENTS_INDEX);
  
  // Clear existing data (keep headers)
  const lastRow = docsSheet.getLastRow();
  if (lastRow > 1) {
    docsSheet.getRange(2, 1, lastRow - 1, docsSheet.getLastColumn()).clearContent();
  }
  
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const documents = [];
  
  function processFolder(folder, category) {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const docId = 'DOC' + new Date().getTime() + Math.random().toString(36).substr(2, 9);
      
      documents.push([
        docId,
        file.getName(),
        file.getMimeType(),
        category,
        '',
        file.getLastUpdated(),
        file.getUrl(),
        file.getId()
      ]);
    }
    
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      processFolder(subfolder, subfolder.getName());
    }
  }
  
  processFolder(folder, 'Root');
  
  if (documents.length > 0) {
    docsSheet.getRange(2, 1, documents.length, 8).setValues(documents);
  }
  
  logAudit('SYNC', 'SYSTEM', `Synced ${documents.length} documents from Drive`);
  
  return createResponse({ success: true, count: documents.length });
}

function getDocuments(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const docsSheet = ss.getSheetByName(SHEETS.DOCUMENTS_INDEX);
  const data = docsSheet.getDataRange().getValues();
  
  const headers = data[0];
  const documents = [];
  
  for (let i = 1; i < data.length; i++) {
    const doc = {};
    headers.forEach((header, index) => {
      doc[header] = data[i][index];
    });
    
    // Apply search filter if provided
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      if (!doc.Name.toLowerCase().includes(searchLower) &&
          !doc.Type.toLowerCase().includes(searchLower) &&
          !doc.Category.toLowerCase().includes(searchLower)) {
        continue;
      }
    }
    
    documents.push(doc);
  }
  
  return createResponse({ success: true, documents });
}

// ============================================
// USER MANAGEMENT
// ============================================

function addUser(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  
  usersSheet.appendRow([
    params.employeeId,
    params.name,
    params.password,
    params.role
  ]);
  
  logAudit('ADD_USER', params.adminId, `Added user: ${params.employeeId}`);
  
  return createResponse({ success: true, message: 'User added successfully' });
}

function deleteUser(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  const data = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.employeeId) {
      usersSheet.deleteRow(i + 1);
      logAudit('DELETE_USER', params.adminId, `Deleted user: ${params.employeeId}`);
      return createResponse({ success: true, message: 'User deleted successfully' });
    }
  }
  
  return createResponse({ success: false, error: 'User not found' });
}

function updatePassword(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  const data = usersSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.employeeId) {
      usersSheet.getRange(i + 1, 3).setValue(params.newPassword);
      logAudit('PASSWORD_CHANGE', params.employeeId, 'Password updated');
      return createResponse({ success: true, message: 'Password updated successfully' });
    }
  }
  
  return createResponse({ success: false, error: 'User not found' });
}

// ============================================
// ANALYTICS
// ============================================

function getAnalytics(params) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const entriesSheet = ss.getSheetByName(SHEETS.ENTRIES);
  const data = entriesSheet.getDataRange().getValues();
  
  let total = 0, approved = 0, pending = 0, rejected = 0;
  const systemCounts = {};
  const trainsetCounts = {};
  
  for (let i = 1; i < data.length; i++) {
    total++;
    const status = data[i][11];
    const system = data[i][6];
    const trainset = data[i][4];
    
    if (status === 'Approved') approved++;
    else if (status === 'Pending') pending++;
    else if (status === 'Rejected') rejected++;
    
    systemCounts[system] = (systemCounts[system] || 0) + 1;
    trainsetCounts[trainset] = (trainsetCounts[trainset] || 0) + 1;
  }
  
  return createResponse({
    success: true,
    analytics: {
      total,
      approved,
      pending,
      rejected,
      systemCounts,
      trainsetCounts
    }
  });
}

// ============================================
// MASTER DATA
// ============================================

function getMasterData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const masterSheet = ss.getSheetByName(SHEETS.MASTER_DATA);
  
  if (!masterSheet) {
    return createResponse({
      success: true,
      masterData: getDefaultMasterData()
    });
  }
  
  const data = masterSheet.getDataRange().getValues();
  const masterData = {};
  
  for (let i = 1; i < data.length; i++) {
    const [category, value] = data[i];
    if (!masterData[category]) {
      masterData[category] = [];
    }
    masterData[category].push(value);
  }
  
  return createResponse({ success: true, masterData });
}

function getDefaultMasterData() {
  return {
    Depot: ['KMRCL', 'BMRCL', 'DMRCL', 'MMRCL'],
    TrainSet: ['TS01', 'TS02', 'TS03', 'TS04', 'TS05', 'TS06', 'TS07', 'TS08', 'TS09', 'TS10', 'TS11', 'TS12', 'TS13', 'TS14', 'TS15', 'TS16', 'TS17'],
    CarNo: ['ALL CARS', 'DMC1', 'TC1', 'MC1', 'MC2', 'TC2', 'DMC2'],
    System: ['General', 'Train', 'Vehicle Structure & Interior Fitting', 'Bogie & Suspension', 'Gangway & Coupler', 'Traction System', 'Brake System', 'Auxiliary Electric System', 'Door System', 'Air Conditioning System', 'Train Integrated Management System', 'Communication System', 'Fire Detection System', 'Lightning System', 'Vehicle control system']
  };
}

// ============================================
// UTILITIES
// ============================================

function testConnection() {
  return createResponse({
    success: true,
    message: 'Connection successful',
    timestamp: new Date(),
    sheetId: SHEET_ID
  });
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateToken(userId, role) {
  return Utilities.base64Encode(`${userId}:${role}:${new Date().getTime()}`);
}

function logAudit(action, userId, details) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const auditSheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
  
  if (auditSheet) {
    auditSheet.appendRow([new Date(), action, userId, details]);
  }
}

function getAllEntries() {
  return getEntries({});
}