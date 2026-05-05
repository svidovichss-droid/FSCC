// History Table Component
import React, { useState } from 'react';
import type { ScanRecord } from '../types';
import { getGradeColor } from '../utils/grading';
import { exportToCSV, clearAllRecords, deleteScanRecord } from '../utils/storage';

interface HistoryTableProps {
  history: ScanRecord[];
  onRefresh: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onRefresh }) => {
  const [filter, setFilter] = useState<string>('all');
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((r) => r.grade === filter);

  const handleExport = () => {
    const csv = exportToCSV(filteredHistory);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datamatrix_scan_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearAllRecords();
    onRefresh();
    setShowConfirm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteScanRecord(id);
    onRefresh();
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(date);
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200">Scan History</h2>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-700 text-slate-200 text-sm rounded px-2 py-1 border border-slate-600"
          >
            <option value="all">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="F">Grade F</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={filteredHistory.length === 0}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded transition-colors"
          >
            Export CSV
          </button>

          {/* Clear Button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={history.length === 0}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 sticky top-0">
            <tr>
              <th className="text-left p-3 text-slate-400 font-medium">Time</th>
              <th className="text-center p-3 text-slate-400 font-medium">Grade</th>
              <th className="text-center p-3 text-slate-400 font-medium">Type</th>
              <th className="text-left p-3 text-slate-400 font-medium">Content</th>
              <th className="text-center p-3 text-slate-400 font-medium">Camera</th>
              <th className="text-center p-3 text-slate-400 font-medium">Time (ms)</th>
              <th className="text-center p-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-slate-500">
                  No scan records yet
                </td>
              </tr>
            ) : (
              filteredHistory.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-3 text-slate-300 font-mono text-xs">
                    {formatTimestamp(record.timestamp)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: `${getGradeColor(record.grade)}20`,
                        color: getGradeColor(record.grade),
                      }}
                    >
                      {record.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        record.isDataMatrix
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-amber-900/50 text-amber-400'
                      }`}
                    >
                      {record.isDataMatrix ? 'DataMatrix' : record.detectedPattern}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs max-w-32 truncate">
                    {record.dataMatrixContent || '-'}
                  </td>
                  <td className="p-3 text-center text-slate-400 text-xs">
                    {record.cameraMode === 'industrial' ? '📷 Industrial' : '📷 Webcam'}
                  </td>
                  <td className="p-3 text-center text-slate-400 font-mono">
                    {record.processingTime}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete record"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-3 border-t border-slate-700 bg-slate-700/30 text-sm text-slate-400">
        Showing {filteredHistory.length} of {history.length} records
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 max-w-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Clear History?</h3>
            <p className="text-slate-400 text-sm mb-4">
              This will permanently delete all {history.length} scan records. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
