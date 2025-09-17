
import { google } from 'googleapis';
import type { PasswordEntry } from '@/lib/types';

const SHEET_NAME = 'Passwords'; // Name of the sheet/tab in your Google Sheet document

const getAuth = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Google Sheets API credentials (client email or private key) are not set in .env file.');
  }
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

const getSheetsApi = () => {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
};

const mapRowToPasswordEntry = (row: any[]): PasswordEntry => ({
  id: row[0],
  userId: row[1],
  appName: row[2],
  username: row[3],
  password: row[4],
  website: row[5] || '',
});

const mapPasswordEntryToRow = (entry: Partial<PasswordEntry>): any[] => [
  entry.id || `pw_${Date.now()}`,
  entry.userId || '',
  entry.appName || '',
  entry.username || '',
  entry.password || '',
  entry.website || '',
];

export async function getPasswords(userId: string): Promise<PasswordEntry[]> {
  try {
    const sheets = getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return [];
    }

    // Skip header row and filter by userId
    return rows.slice(1)
      .map(mapRowToPasswordEntry)
      .filter(p => p.userId === userId);
  } catch (error: any) {
    console.error('Google Sheets API error (getPasswords):', error.message);
    // Throw a more specific error to help with debugging
    throw new Error(`Failed to fetch passwords from Google Sheets: ${error.message}`);
  }
}

export async function addPassword(newPassword: Omit<PasswordEntry, 'id'>): Promise<PasswordEntry> {
  const entry = { ...newPassword, id: `pw_${Date.now()}` };
  const row = mapPasswordEntryToRow(entry);

  try {
    const sheets = getSheetsApi();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    return entry;
  } catch (error: any) {
    console.error('Google Sheets API error (addPassword):', error.message);
    throw new Error(`Failed to add password to Google Sheets: ${error.message}`);
  }
}

export async function updatePassword(updatedPassword: PasswordEntry): Promise<PasswordEntry> {
  try {
    const sheets = getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${SHEET_NAME}!A:A`, // Only need the ID column to find the row index
    });
    
    const ids = response.data.values?.flat() || [];
    const rowIndex = ids.indexOf(updatedPassword.id);

    if (rowIndex === -1) {
        throw new Error('Password not found for update.');
    }
    
    const sheetRowIndex = rowIndex + 1; // 1-based index for sheets API
    const rowData = mapPasswordEntryToRow(updatedPassword);

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${SHEET_NAME}!A${sheetRowIndex}:F${sheetRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [rowData],
        },
    });
    return updatedPassword;
  } catch (error: any) {
    console.error('Google Sheets API error (updatePassword):', error.message);
    throw new Error(`Failed to update password in Google Sheets: ${error.message}`);
  }
}

export async function deletePassword(id: string): Promise<void> {
  try {
    const sheets = getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${SHEET_NAME}!A:A`,
    });

    const ids = response.data.values?.flat() || [];
    const rowIndex = ids.indexOf(id);

    if (rowIndex === -1) {
        console.warn(`Password with id ${id} not found for deletion.`);
        return;
    }
    
    const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetId = sheetInfo.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId;
    
    if (sheetId === undefined) {
        throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1
                    }
                }
            }]
        }
    });

  } catch (error: any) {
    console.error('Google Sheets API error (deletePassword):', error.message);
    throw new Error(`Failed to delete password from Google Sheets: ${error.message}`);
  }
}

export async function deletePasswords(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const sheets = getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${SHEET_NAME}!A:A`,
    });
    
    const allIds = response.data.values?.flat() || [];
    const rowIndicesToDelete = ids.map(id => allIds.indexOf(id)).filter(index => index !== -1);

    if (rowIndicesToDelete.length === 0) {
        console.warn('No matching passwords found for deletion.');
        return;
    }

    const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    const sheetId = sheetInfo.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId;
    
    if (sheetId === undefined) {
        throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
    }

    // Sort indices in descending order to avoid shifting issues when deleting
    rowIndicesToDelete.sort((a, b) => b - a);

    const requests = rowIndicesToDelete.map(rowIndex => ({
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
            }
        }
    }));
    
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
            requests: requests
        }
    });

  } catch (error: any) {
    console.error('Google Sheets API error (deletePasswords):', error.message);
    throw new Error(`Failed to delete passwords from Google Sheets: ${error.message}`);
  }
}
