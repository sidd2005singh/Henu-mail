// HENU MAIL - Spreadsheet & CSV Ingestion Engine
// Organization: HENU OS Private Limited

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedSpreadsheet {
  filename: string;
  fileType: 'csv' | 'xlsx' | 'xls';
  fileSize: number;
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export async function parseFile(file: File): Promise<ParsedSpreadsheet> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCsvFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else {
    throw new Error(`Unsupported file type: .${extension}. Please upload a CSV or XLSX spreadsheet.`);
  }
}

export function parseCsvText(csvText: string, filename = 'data.csv', fileSize = 0): ParsedSpreadsheet {
  const result = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV Parsing Error: ${result.errors[0].message}`);
  }

  const headers = result.meta.fields || [];
  const rows = result.data.filter((r) => Object.values(r).some((v) => v !== null && v !== undefined && String(v).trim().length > 0));

  return {
    filename,
    fileType: 'csv',
    fileSize: fileSize || csvText.length,
    sheetNames: ['CSV Data'],
    activeSheet: 'CSV Data',
    headers,
    rows,
    totalRows: rows.length,
  };
}

async function parseCsvFile(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data.filter((r) =>
          Object.values(r).some((v) => v !== null && v !== undefined && String(v).trim().length > 0)
        );

        resolve({
          filename: file.name,
          fileType: 'csv',
          fileSize: file.size,
          sheetNames: ['CSV Data'],
          activeSheet: 'CSV Data',
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV Parsing Failed: ${error.message}`));
      },
    });
  });
}

async function parseExcelFile(file: File): Promise<ParsedSpreadsheet> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel workbook contains no readable sheets.');
  }

  const activeSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error('The selected Excel sheet contains no data rows.');
  }

  const headers = Object.keys(rows[0] || {});

  return {
    filename: file.name,
    fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
    fileSize: file.size,
    sheetNames: workbook.SheetNames,
    activeSheet,
    headers,
    rows,
    totalRows: rows.length,
  };
}
