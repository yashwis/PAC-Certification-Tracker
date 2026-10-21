import * as XLSX from 'xlsx';
import { TestCase, TestStatus, PSPRole, CertificationPhase } from '../types';

export interface ImportResult {
  success: boolean;
  cases: TestCase[];
  error?: string;
  count: number;
}

export function parseExcelBuffer(buffer: ArrayBuffer): ImportResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { success: false, cases: [], count: 0, error: 'No sheets found in workbook.' };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    return parseRows(rawRows);
  } catch (err: any) {
    return { success: false, cases: [], count: 0, error: err?.message || 'Failed to parse Excel file.' };
  }
}

export function parsePastedText(text: string): ImportResult {
  try {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, cases: [], count: 0, error: 'Input must have at least a header row and data rows.' };
    }

    // Detect delimiter: tab or comma
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    // Split header
    const headers = splitDelimited(firstLine, delimiter).map(h => h.trim());
    
    const rawRows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitDelimited(lines[i], delimiter);
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx] !== undefined ? cols[idx].trim() : '';
      });
      rawRows.push(row);
    }

    return parseRows(rawRows);
  } catch (err: any) {
    return { success: false, cases: [], count: 0, error: err?.message || 'Failed to parse pasted text.' };
  }
}

function splitDelimited(row: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return row.split('\t');
  }
  // Basic CSV regex split
  const pattern = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
  const matches = row.match(pattern);
  return matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : row.split(',');
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseRows(rows: Record<string, any>[]): ImportResult {
  if (!rows || rows.length === 0) {
    return { success: false, cases: [], count: 0, error: 'Sheet contains no data rows.' };
  }

  // Find column keys
  const sample = rows[0];
  const keys = Object.keys(sample);

  const findKey = (...aliases: string[]): string | undefined => {
    return keys.find(k => {
      const norm = normalizeKey(k);
      return aliases.some(alias => norm.includes(alias) || alias.includes(norm));
    });
  };

  const testIdKey = findKey('testid', 'idtest', 'id', 'testcode', 'codigo');
  const codeKey = findKey('code', 'codigo', 'cod', 'usecase') || testIdKey;
  const descKey = findKey('description', 'descripcion', 'desc', 'title', 'nombre', 'scenario');
  const roleKey = findKey('role', 'rol', 'psprole');
  const phaseKey = findKey('phase', 'fase');
  const dateKey = findKey('date', 'fecha', 'scheduleddate', 'day');
  const otherStatusKey = findKey('otheraccount', 'otherstatus', 'other', 'otros', 'normalstatus');
  const ourStatusKey = findKey('ouraccount', 'ourstatus', 'our', 'turingstatus', 'juspay');
  const blockedKey = findKey('blockedreason', 'note', 'statusnote', 'motivo', 'bloqueo');

  if (!testIdKey) {
    return {
      success: false,
      cases: [],
      count: 0,
      error: `Could not identify a "Test ID" column in sheet. Found headers: ${keys.join(', ')}`
    };
  }

  const parsedCases: TestCase[] = [];

  rows.forEach((row, index) => {
    const rawId = String(row[testIdKey] || '').trim();
    if (!rawId) return; // Skip empty rows

    const rawCode = codeKey && row[codeKey] ? String(row[codeKey]).trim() : rawId;
    const rawDesc = descKey && row[descKey] ? String(row[descKey]).trim() : `Test case ${rawId}`;
    
    // Role
    let role: PSPRole = 'Payer PSP';
    if (roleKey && row[roleKey]) {
      const val = String(row[roleKey]).toLowerCase();
      if (val.includes('payee') || val.includes('beneficiario') || val.includes('receptor')) {
        role = 'Payee PSP';
      }
    }

    // Phase
    let phase: CertificationPhase = 'Week 1 – TAPP↔TAPP';
    if (phaseKey && row[phaseKey]) {
      const val = String(row[phaseKey]).toLowerCase();
      if (val.includes('week 2') || val.includes('cce') || val.includes('semana 2')) {
        phase = 'Week 2 – TAPP↔CCE';
      }
    }

    // Scheduled Date
    let scheduledDate = '06-Oct-26';
    if (dateKey && row[dateKey]) {
      scheduledDate = String(row[dateKey]).trim();
    }

    // Statuses
    const parseStatus = (val?: any, defaultStatus: TestStatus = 'Pending'): TestStatus => {
      if (!val) return defaultStatus;
      const s = String(val).toLowerCase();
      if (s.includes('pass') || s.includes('aprobado') || s.includes('ok') || s === 'done') return 'Pass';
      if (s.includes('block') || s.includes('bloqueado')) return 'Blocked';
      if (s.includes('fail') || s.includes('fallido')) return 'Fail';
      if (s.includes('retest')) return 'Retest';
      if (s.includes('progress') || s.includes('progreso')) return 'In Progress';
      return 'Pending';
    };

    const otherStatus = parseStatus(otherStatusKey ? row[otherStatusKey] : undefined, 'Pending');
    const ourStatus = parseStatus(ourStatusKey ? row[ourStatusKey] : undefined, 'Pending');
    const blockedReason = blockedKey && row[blockedKey] ? String(row[blockedKey]).trim() : undefined;

    parsedCases.push({
      id: rawId,
      code: rawCode,
      title: rawCode || rawId,
      description: rawDesc,
      role,
      phase,
      scheduledDate,
      dayLabel: scheduledDate,
      otherAccountProviderStatus: otherStatus,
      ourAccountProviderStatus: ourStatus,
      blockedReason,
      lastUpdated: 'Imported from Excel'
    });
  });

  return {
    success: true,
    cases: parsedCases,
    count: parsedCases.length
  };
}
