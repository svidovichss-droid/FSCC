// IndexedDB Storage for Scan History
import type { ScanRecord } from '../types';

const DB_NAME = 'DataMatrixScannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'scanHistory';

let dbInstance: IDBDatabase | null = null;

/**
 * Open or create IndexedDB database
 */
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('grade', 'grade', { unique: false });
        store.createIndex('cameraMode', 'cameraMode', { unique: false });
        store.createIndex('isDataMatrix', 'isDataMatrix', { unique: false });
      }
    };
  });
}

/**
 * Add a scan record to history
 */
export async function addScanRecord(record: ScanRecord): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Convert Date to ISO string for storage
    const storedRecord = {
      ...record,
      timestamp: record.timestamp instanceof Date
        ? record.timestamp.toISOString()
        : record.timestamp,
    };

    const request = store.add(storedRecord);

    request.onerror = () => reject(new Error(`Failed to add record: ${request.error}`));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all scan records
 */
export async function getAllScanRecords(): Promise<ScanRecord[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(new Error(`Failed to get records: ${request.error}`));
    request.onsuccess = () => {
      const records = request.result.map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp),
      }));
      // Sort by timestamp descending (newest first)
      records.sort((a: ScanRecord, b: ScanRecord) =>
        b.timestamp.getTime() - a.timestamp.getTime()
      );
      resolve(records);
    };
  });
}

/**
 * Get scan records with optional filters
 */
export async function getFilteredRecords(filters: {
  startDate?: Date;
  endDate?: Date;
  grade?: ScanRecord['grade'];
  cameraMode?: ScanRecord['cameraMode'];
  isDataMatrix?: boolean;
}): Promise<ScanRecord[]> {
  const allRecords = await getAllScanRecords();

  return allRecords.filter((record) => {
    if (filters.startDate && record.timestamp < filters.startDate) return false;
    if (filters.endDate && record.timestamp > filters.endDate) return false;
    if (filters.grade && record.grade !== filters.grade) return false;
    if (filters.cameraMode && record.cameraMode !== filters.cameraMode) return false;
    if (filters.isDataMatrix !== undefined && record.isDataMatrix !== filters.isDataMatrix) return false;
    return true;
  });
}

/**
 * Delete a specific scan record
 */
export async function deleteScanRecord(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(new Error(`Failed to delete record: ${request.error}`));
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all scan records
 */
export async function clearAllRecords(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(new Error(`Failed to clear records: ${request.error}`));
    request.onsuccess = () => resolve();
  });
}

/**
 * Export records to CSV format
 */
export function exportToCSV(records: ScanRecord[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'DataMatrix Content',
    'Grade',
    'SC',
    'C',
    'M',
    'MR',
    'FP',
    'AN',
    'GN',
    'UEC',
    'Camera Mode',
    'Is DataMatrix',
    'Pattern',
    'Processing Time (ms)',
  ];

  const rows = records.map((record) => [
    record.id,
    record.timestamp.toISOString(),
    record.dataMatrixContent || '',
    record.grade,
    record.grades.symbolContrast.toFixed(2),
    record.grades.cellDecode.toFixed(2),
    record.grades.modulation.toFixed(2),
    record.grades.reflectanceMargin.toFixed(2),
    record.grades.finderPatternDamage.toFixed(2),
    record.grades.axialNonUniformity.toFixed(2),
    record.grades.gridNonUniformity.toFixed(2),
    record.grades.unusedErrorCorrection.toFixed(2),
    record.cameraMode,
    record.isDataMatrix ? 'Yes' : 'No',
    record.detectedPattern,
    record.processingTime.toString(),
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}

/**
 * Get statistics summary
 */
export function getStatistics(records: ScanRecord[]): {
  total: number;
  gradeDistribution: Record<string, number>;
  dataMatrixRate: number;
  averageProcessingTime: number;
} {
  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let dataMatrixCount = 0;
  let totalProcessingTime = 0;

  records.forEach((record) => {
    gradeDistribution[record.grade]++;
    if (record.isDataMatrix) dataMatrixCount++;
    totalProcessingTime += record.processingTime;
  });

  return {
    total: records.length,
    gradeDistribution,
    dataMatrixRate: records.length > 0 ? (dataMatrixCount / records.length) * 100 : 0,
    averageProcessingTime: records.length > 0 ? totalProcessingTime / records.length : 0,
  };
}
