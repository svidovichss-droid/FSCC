// ISO 15415 DataMatrix Quality Scanner Types

export interface QualityGrades {
  overall: 'A' | 'B' | 'C' | 'D' | 'F';
  symbolContrast: number;      // SC
  cellDecode: number;           // C
  modulation: number;           // M
  reflectanceMargin: number;   // MR
  finderPatternDamage: number; // FP
  axialNonUniformity: number;  // AN
  gridNonUniformity: number;   // GN
  unusedErrorCorrection: number; // UEC
}

export interface ScanRecord {
  id: string;
  timestamp: Date;
  dataMatrixContent: string | null;
  grade: QualityGrades['overall'];
  grades: QualityGrades;
  cameraMode: 'industrial' | 'webcam';
  isDataMatrix: boolean;
  detectedPattern: string;
  processingTime: number;
}

export interface CameraConfig {
  mode: 'industrial' | 'webcam';
  deviceId?: string;
  resolution: { width: number; height: number };
  exposure: number;
  gain: number;
}

export interface AppState {
  isScanning: boolean;
  currentGrade: QualityGrades['overall'] | null;
  currentGrades: QualityGrades | null;
  lastDetection: {
    content: string | null;
    isDataMatrix: boolean;
    pattern: string;
    bounds: { x: number; y: number; width: number; height: number };
  } | null;
  history: ScanRecord[];
  cameraConfig: CameraConfig;
  audioEnabled: boolean;
  volume: number;
  selectedCamera: string | null;
}

export type AppAction =
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_GRADE'; payload: { grade: QualityGrades['overall']; grades: QualityGrades } }
  | { type: 'SET_DETECTION'; payload: AppState['lastDetection'] }
  | { type: 'ADD_TO_HISTORY'; payload: ScanRecord }
  | { type: 'SET_HISTORY'; payload: ScanRecord[] }
  | { type: 'SET_CAMERA_MODE'; payload: CameraConfig['mode'] }
  | { type: 'SET_SELECTED_CAMERA'; payload: string | null }
  | { type: 'SET_CAMERA_CONFIG'; payload: Partial<CameraConfig> }
  | { type: 'SET_AUDIO_ENABLED'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'CLEAR_HISTORY' };
