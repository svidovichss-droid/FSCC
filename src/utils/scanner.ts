// DataMatrix Simulation Utilities
// This module simulates DataMatrix detection for demonstration purposes
// In production, this would interface with actual camera SDKs

export interface SimulatedDataMatrix {
  detected: boolean;
  content: string | null;
  isDataMatrix: boolean;
  pattern: string;
  modules: number[][] | null;
  bounds: { x: number; y: number; width: number; height: number };
  contrast: number;
  decodeQuality: number;
}

/**
 * Simulated DataMatrix patterns for demo
 */
const DEMO_PATTERNS = [
  // Valid DataMatrix patterns
  {
    pattern: 'datamatrix_valid',
    isDataMatrix: true,
    content: 'PART-2024-001-A',
    modules: generateDataMatrixModules(12),
    contrast: 0.92,
    decodeQuality: 0.95,
  },
  {
    pattern: 'datamatrix_valid',
    isDataMatrix: true,
    content: 'SN:ABC123456789',
    modules: generateDataMatrixModules(14),
    contrast: 0.88,
    decodeQuality: 0.90,
  },
  {
    pattern: 'datamatrix_low_quality',
    isDataMatrix: true,
    content: 'LOT-2024-05-15',
    modules: generateDataMatrixModules(10),
    contrast: 0.65,
    decodeQuality: 0.72,
  },
  {
    pattern: 'datamatrix_damaged',
    isDataMatrix: true,
    content: null, // Unreadable
    modules: generateDamagedMatrix(12),
    contrast: 0.45,
    decodeQuality: 0.50,
  },
  // Non-DataMatrix squares
  {
    pattern: 'qr_code',
    isDataMatrix: false,
    content: null,
    modules: generateQRPattern(12),
    contrast: 0.85,
    decodeQuality: 0.0,
  },
  {
    pattern: 'random_squares',
    isDataMatrix: false,
    content: null,
    modules: generateRandomSquares(12),
    contrast: 0.75,
    decodeQuality: 0.0,
  },
  {
    pattern: 'barcode',
    isDataMatrix: false,
    content: null,
    modules: generateBarcodePattern(12),
    contrast: 0.80,
    decodeQuality: 0.0,
  },
  {
    pattern: 'damaged_square',
    isDataMatrix: false,
    content: null,
    modules: generateDamagedMatrix(12),
    contrast: 0.40,
    decodeQuality: 0.0,
  },
];

/**
 * Generate simulated DataMatrix module pattern
 */
function generateDataMatrixModules(size: number): number[][] {
  const modules: number[][] = [];

  // L-shaped finder pattern (top-left)
  for (let row = 0; row < size; row++) {
    modules[row] = [];
    for (let col = 0; col < size; col++) {
      if (row === 0 || col === 0) {
        modules[row][col] = 1; // Border
      } else if (row === 1 || col === 1) {
        modules[row][col] = 1; // Finder pattern
      } else {
        // Data region - pseudo-random with ECC
        modules[row][col] = Math.random() > 0.5 ? 1 : 0;
      }
    }
  }

  return modules;
}

/**
 * Generate damaged matrix pattern
 */
function generateDamagedMatrix(size: number): number[][] {
  const modules = generateDataMatrixModules(size);

  // Add damage by randomizing some cells
  for (let i = 0; i < size * 2; i++) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (row > 1 && col > 1) {
      modules[row][col] = Math.random() > 0.5 ? 1 : 0;
    }
  }

  return modules;
}

/**
 * Generate QR code-like pattern (not DataMatrix)
 */
function generateQRPattern(size: number): number[][] {
  const modules: number[][] = [];

  for (let row = 0; row < size; row++) {
    modules[row] = [];
    for (let col = 0; col < size; col++) {
      // Three corner finder patterns (QR-style, not DataMatrix)
      const isTopLeftFinder = row < 4 && col < 4 &&
        ((row === 0 || row === 3 || col === 0 || col === 3) ?
          (row + col) % 2 === 0 : (row + col) % 2 === 1);
      const isTopRightFinder = row < 4 && col >= size - 4 &&
        ((row === 0 || row === 3 || col === size - 4 || col === size - 1) ?
          (row + col) % 2 === 0 : (row + col) % 2 === 1);
      const isBottomLeftFinder = row >= size - 4 && col < 4 &&
        ((row === size - 4 || row === size - 1 || col === 0 || col === 3) ?
          (row + col) % 2 === 0 : (row + col) % 2 === 1);

      modules[row][col] = isTopLeftFinder || isTopRightFinder || isBottomLeftFinder ? 1 : 0;
    }
  }

  return modules;
}

/**
 * Generate random squares (not DataMatrix)
 */
function generateRandomSquares(size: number): number[][] {
  const modules: number[][] = [];

  for (let row = 0; row < size; row++) {
    modules[row] = [];
    for (let col = 0; col < size; col++) {
      // Checkboard pattern
      modules[row][col] = (row + col) % 2;
    }
  }

  return modules;
}

/**
 * Generate barcode-like pattern (not DataMatrix)
 */
function generateBarcodePattern(size: number): number[][] {
  const modules: number[][] = [];

  for (let row = 0; row < size; row++) {
    modules[row] = [];
    for (let col = 0; col < size; col++) {
      // Vertical lines
      modules[row][col] = col % 3 === 0 ? 1 : 0;
    }
  }

  return modules;
}

/**
 * Simulate scanning a frame from camera
 * This simulates the detection and recognition process
 */
export function simulateScanFrame(): SimulatedDataMatrix {
  // 70% chance of detecting something
  const detectionChance = 0.7;

  if (Math.random() > detectionChance) {
    return {
      detected: false,
      content: null,
      isDataMatrix: false,
      pattern: 'none',
      modules: null,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      contrast: 0,
      decodeQuality: 0,
    };
  }

  // Select random pattern
  const patternData = DEMO_PATTERNS[Math.floor(Math.random() * DEMO_PATTERNS.length)];
  const size = 10 + Math.floor(Math.random() * 40); // Variable size

  // Generate bounds in frame
  const bounds = {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    width: size * 5 + Math.floor(Math.random() * 20),
    height: size * 5 + Math.floor(Math.random() * 20),
  };

  // Regenerate modules with correct size if needed
  let modules: number[][];
  if (patternData.pattern === 'datamatrix_valid') {
    modules = generateDataMatrixModules(Math.min(16, size));
  } else if (patternData.pattern === 'datamatrix_low_quality') {
    modules = generateDataMatrixModules(Math.min(12, size));
  } else if (patternData.pattern === 'datamatrix_damaged' || patternData.pattern === 'damaged_square') {
    modules = generateDamagedMatrix(Math.min(12, size));
  } else if (patternData.pattern === 'qr_code') {
    modules = generateQRPattern(Math.min(16, size));
  } else if (patternData.pattern === 'random_squares') {
    modules = generateRandomSquares(Math.min(12, size));
  } else {
    modules = generateBarcodePattern(Math.min(14, size));
  }

  return {
    detected: true,
    content: patternData.content,
    isDataMatrix: patternData.isDataMatrix,
    pattern: patternData.pattern,
    modules,
    bounds,
    contrast: patternData.contrast + (Math.random() - 0.5) * 0.1,
    decodeQuality: patternData.decodeQuality,
  };
}

/**
 * Analyze detected pattern to determine if it's DataMatrix
 * Uses the module pattern characteristics
 */
export function analyzePattern(modules: number[][] | null): {
  isDataMatrix: boolean;
  patternType: string;
  confidence: number;
} {
  if (!modules || modules.length < 8) {
    return { isDataMatrix: false, patternType: 'unknown', confidence: 0 };
  }

  // Check for L-shaped finder pattern (DataMatrix characteristic)
  let leftBorderSolid = true;
  let topBorderSolid = true;
  let cornerModules = 0;

  for (let i = 0; i < Math.min(5, modules.length); i++) {
    if (modules[0][i] !== 1) leftBorderSolid = false;
    if (modules[i][0] !== 1) topBorderSolid = false;
  }

  // Count corner density
  const quadrantSize = Math.floor(modules.length / 2);
  for (let row = 0; row < quadrantSize; row++) {
    for (let col = 0; col < quadrantSize; col++) {
      cornerModules += modules[row][col];
    }
  }

  const cornerDensity = cornerModules / (quadrantSize * quadrantSize);

  // DataMatrix should have solid border and checkerboard data region
  if (leftBorderSolid && topBorderSolid && cornerDensity > 0.3 && cornerDensity < 0.7) {
    return { isDataMatrix: true, patternType: 'datamatrix', confidence: 0.9 };
  }

  // Check for QR-style three-finder pattern
  const hasThreeFinders = checkQRFinders(modules);
  if (hasThreeFinders) {
    return { isDataMatrix: false, patternType: 'qr_code', confidence: 0.85 };
  }

  // Check for barcode pattern (vertical lines)
  const isVerticalBarcode = checkVerticalBarcode(modules);
  if (isVerticalBarcode) {
    return { isDataMatrix: false, patternType: 'barcode', confidence: 0.8 };
  }

  // Unknown pattern - likely not DataMatrix
  return { isDataMatrix: false, patternType: 'unknown_square', confidence: 0.5 };
}

/**
 * Check if pattern has QR-style finder patterns
 */
function checkQRFinders(modules: number[][]): boolean {
  const size = modules.length;
  const finderSize = 4;

  // Check top-left finder
  let topLeftValid = true;
  for (let row = 0; row < finderSize; row++) {
    for (let col = 0; col < finderSize; col++) {
      const isEdge = row === 0 || row === finderSize - 1 || col === 0 || col === finderSize - 1;
      const expected = isEdge ? 1 : 0;
      if (modules[row][col] !== expected) topLeftValid = false;
    }
  }

  // Check top-right finder
  let topRightValid = true;
  for (let row = 0; row < finderSize; row++) {
    for (let col = size - finderSize; col < size; col++) {
      const isEdge = row === 0 || row === finderSize - 1 || col === size - finderSize || col === size - 1;
      const expected = isEdge ? 1 : 0;
      if (modules[row][col] !== expected) topRightValid = false;
    }
  }

  return topLeftValid || topRightValid;
}

/**
 * Check if pattern is vertical barcode
 */
function checkVerticalBarcode(modules: number[][]): boolean {
  const size = modules.length;
  let verticalLineCount = 0;

  for (let col = 0; col < size; col++) {
    let isVerticalLine = true;
    for (let row = 0; row < size; row++) {
      if (modules[row][col] !== modules[0][col]) {
        isVerticalLine = false;
        break;
      }
    }
    if (isVerticalLine) verticalLineCount++;
  }

  return verticalLineCount > size / 3;
}
