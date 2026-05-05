// Grade Display Component
import React from 'react';
import type { QualityGrades } from '../types';
import { getGradeColor } from '../utils/grading';

interface GradeDisplayProps {
  grade: QualityGrades['overall'] | null;
  grades: QualityGrades | null;
  isScanning: boolean;
}

const gradeLabels: Record<string, string> = {
  SC: 'Symbol Contrast',
  C: 'Cell Decode',
  M: 'Modulation',
  MR: 'Reflectance Margin',
  FP: 'Finder Pattern',
  AN: 'Axial Non-Uniformity',
  GN: 'Grid Non-Uniformity',
  UEC: 'Unused Error Correction',
};

const gradeKeys: (keyof Pick<QualityGrades, 'symbolContrast' | 'cellDecode' | 'modulation' | 'reflectanceMargin' | 'finderPatternDamage' | 'axialNonUniformity' | 'gridNonUniformity' | 'unusedErrorCorrection'>)[] = [
  'symbolContrast',
  'cellDecode',
  'modulation',
  'reflectanceMargin',
  'finderPatternDamage',
  'axialNonUniformity',
  'gridNonUniformity',
  'unusedErrorCorrection',
];

const gradeKeyLabels: Record<string, string> = {
  symbolContrast: 'SC',
  cellDecode: 'C',
  modulation: 'M',
  reflectanceMargin: 'MR',
  finderPatternDamage: 'FP',
  axialNonUniformity: 'AN',
  gridNonUniformity: 'GN',
  unusedErrorCorrection: 'UEC',
};

export const GradeDisplay: React.FC<GradeDisplayProps> = ({ grade, grades, isScanning }) => {
  const gradeColor = grade ? getGradeColor(grade) : '#6b7280';

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-200">ISO 15415 Grade</h2>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: isScanning ? '#22c55e' : '#6b7280' }}
          />
          <span className="text-sm text-slate-400">
            {isScanning ? 'Scanning' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Main Grade Display */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-32 h-32 rounded-xl flex items-center justify-center border-4 transition-all duration-300"
          style={{
            backgroundColor: `${gradeColor}20`,
            borderColor: gradeColor,
            boxShadow: grade ? `0 0 30px ${gradeColor}40` : 'none',
          }}
        >
          <span
            className="text-6xl font-bold transition-all duration-300"
            style={{ color: gradeColor }}
          >
            {grade || '-'}
          </span>
        </div>
        {grade && (
          <p className="mt-3 text-sm text-slate-400">
            {grade === 'A' && 'Excellent'}
            {grade === 'B' && 'Good'}
            {grade === 'C' && 'Acceptable'}
            {grade === 'D' && 'Warning'}
            {grade === 'F' && 'Failed'}
          </p>
        )}
      </div>

      {/* Parameter Grades */}
      {grades && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Parameter Grades</h3>
          {gradeKeys.map((key) => {
            const value = grades[key];
            const color = getGradeColor(value >= 3.5 ? 'A' : value >= 2.5 ? 'B' : value >= 1.5 ? 'C' : value >= 0.5 ? 'D' : 'F');

            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-8 text-xs font-mono text-slate-400">
                  {gradeKeyLabels[key]}
                </span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(value / 4) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="w-8 text-xs font-mono text-slate-400 text-right">
                  {value.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!grades && !isScanning && (
        <div className="text-center text-slate-500 py-8">
          <p className="text-sm">Start scanning to see grades</p>
        </div>
      )}
    </div>
  );
};
