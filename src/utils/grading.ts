// ISO 15415 DataMatrix Quality Grading Utilities
import type { QualityGrades } from '../types';

/**
 * Simulated DataMatrix detection for web-based processing
 * In production, this would interface with actual industrial camera SDKs
 */
export interface DetectedPattern {
  isDataMatrix: boolean;
  pattern: string;
  modules: number[][];
  bounds: { x: number; y: number; width: number; height: number };
  contrast: number;
}

/**
 * Calculate ISO 15415 grades for a DataMatrix code
 * Reference: ISO 15415:2011 Information technology - Automatic identification
 */
export function calculateISO15415Grades(
  contrast: number,
  decodeQuality: number,
  modules: number[][],
  finderDamage: number
): QualityGrades {
  // Symbol Contrast (SC) - Range 0-1, converted to grade 0-4
  const sc = Math.min(1, Math.max(0, contrast));
  const scGrade = calculateParameterGrade(sc);

  // Cell Decode (C) - Fundamental decodability 0-1
  const cGrade = calculateParameterGrade(Math.min(1, decodeQuality));

  // Modulation (M) - Combination of contrast and decode quality
  const modulation = sc * decodeQuality;
  const mGrade = calculateParameterGrade(Math.min(1, modulation * 2));

  // Reflectance Margin (MR) - Edge contrast ratio
  const mr = Math.min(1, sc * 0.8 + decodeQuality * 0.2);
  const mrGrade = calculateParameterGrade(mr);

  // Finder Pattern Damage (FP) - 0=no damage, 1=severe damage
  const fp = 1 - Math.min(1, finderDamage);
  const fpGrade = calculateParameterGrade(fp);

  // Axial Non-Uniformity (AN) - Grid aspect ratio distortion
  const an = Math.random() * 0.3 + 0.7; // Simulated
  const anGrade = calculateParameterGrade(an);

  // Grid Non-Uniformity (GN) - Module placement errors
  const gn = Math.random() * 0.2 + 0.8; // Simulated
  const gnGrade = calculateParameterGrade(gn);

  // Unused Error Correction (UEC) - Remaining ECC capacity
  const uec = Math.random() * 0.3 + 0.7; // Simulated
  const uecGrade = calculateParameterGrade(uec);

  return {
    symbolContrast: scGrade,
    cellDecode: cGrade,
    modulation: mGrade,
    reflectanceMargin: mrGrade,
    finderPatternDamage: fpGrade,
    axialNonUniformity: anGrade,
    gridNonUniformity: gnGrade,
    unusedErrorCorrection: uecGrade,
    overall: 'A', // Will be calculated
  };
}

/**
 * Convert parameter value (0-1) to grade (0-4)
 */
function calculateParameterGrade(value: number): number {
  if (value >= 0.95) return 4.0;
  if (value >= 0.85) return 3.5;
  if (value >= 0.75) return 3.0;
  if (value >= 0.65) return 2.5;
  if (value >= 0.55) return 2.0;
  if (value >= 0.45) return 1.5;
  if (value >= 0.35) return 1.0;
  if (value >= 0.25) return 0.5;
  return 0;
}

/**
 * Calculate overall ISO 15415 grade from parameter grades
 */
export function calculateOverallGrade(grades: QualityGrades): QualityGrades['overall'] {
  // Use the lowest grade among all parameters
  const gradesArray = [
    grades.symbolContrast,
    grades.cellDecode,
    grades.modulation,
    grades.reflectanceMargin,
    grades.finderPatternDamage,
    grades.axialNonUniformity,
    grades.gridNonUniformity,
    grades.unusedErrorCorrection,
  ];

  const minGrade = Math.min(...gradesArray);

  if (minGrade >= 3.5) return 'A';
  if (minGrade >= 2.5) return 'B';
  if (minGrade >= 1.5) return 'C';
  if (minGrade >= 0.5) return 'D';
  return 'F';
}

/**
 * Get grade color for UI display
 */
export function getGradeColor(grade: QualityGrades['overall']): string {
  switch (grade) {
    case 'A': return '#22c55e'; // Green
    case 'B': return '#84cc16'; // Lime
    case 'C': return '#f59e0b'; // Amber
    case 'D': return '#ef4444'; // Red
    case 'F': return '#dc2626'; // Dark Red
    default: return '#6b7280'; // Gray
  }
}

/**
 * Determine if pattern is DataMatrix and calculate grades
 */
export function analyzeDataMatrix(
  modules: number[][] | null,
  contrast: number,
  isReadable: boolean,
  detectedPattern: string
): { grades: QualityGrades; isDataMatrix: boolean } {
  // Check if it's a valid DataMatrix
  if (!isReadable) {
    return {
      isDataMatrix: false,
      grades: {
        symbolContrast: 0,
        cellDecode: 0,
        modulation: 0,
        reflectanceMargin: 0,
        finderPatternDamage: 0,
        axialNonUniformity: 0,
        gridNonUniformity: 0,
        unusedErrorCorrection: 0,
        overall: 'F',
      },
    };
  }

  // If modules detected, analyze quality
  if (modules && modules.length > 0) {
    const finderDamage = calculateFinderDamage(modules);
    const grades = calculateISO15415Grades(contrast, 0.85, modules, finderDamage);
    grades.overall = calculateOverallGrade(grades);
    return { isDataMatrix: true, grades };
  }

  // Unknown pattern - grade F
  return {
    isDataMatrix: false,
    grades: {
      symbolContrast: 0,
      cellDecode: 0,
      modulation: 0,
      reflectanceMargin: 0,
      finderPatternDamage: 0,
      axialNonUniformity: 0,
      gridNonUniformity: 0,
      unusedErrorCorrection: 0,
      overall: 'F',
    },
  };
}

/**
 * Calculate finder pattern damage (corners)
 */
function calculateFinderDamage(modules: number[][]): number {
  if (modules.length < 10) return 1; // Too small

  // Check L-shaped finder patterns
  let damage = 0;
  const size = modules.length;

  // Top-left corner pattern
  for (let i = 0; i < Math.min(5, size / 2); i++) {
    if (modules[0][i] === 1) damage += 0.1;
    if (modules[i][0] === 1) damage += 0.1;
  }

  // Bottom-left and top-right (data regions) should be checkerboard
  const checkDensity = modules.slice(size/2, size)
    .reduce((acc, row) => acc + row.slice(0, size/2).reduce((a, b) => a + b, 0), 0);
  const expectedDensity = (size * size) / 4 * 0.5;
  if (Math.abs(checkDensity - expectedDensity) > expectedDensity * 0.3) {
    damage += 0.5;
  }

  return Math.min(1, damage);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
