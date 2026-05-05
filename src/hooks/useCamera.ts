// Camera Management Hook
import { useState, useEffect, useRef, useCallback } from 'react';
import { initAudioContext, resumeAudio, isAudioReady } from '../utils/audio';
import { simulateScanFrame, analyzePattern } from '../utils/scanner';
import {
  calculateISO15415Grades,
  calculateOverallGrade,
  analyzeDataMatrix,
  generateId,
} from '../utils/grading';
import { playGradeAlert } from '../utils/audio';
import { addScanRecord, getAllScanRecords } from '../utils/storage';
import type { ScanRecord, CameraConfig, QualityGrades } from '../types';

export interface UseCameraReturn {
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  toggleScanning: () => void;
  cameraConfig: CameraConfig;
  setCameraConfig: (config: Partial<CameraConfig>) => void;
  availableCameras: MediaDeviceInfo[];
  selectedCamera: string | null;
  setSelectedCamera: (deviceId: string | null) => void;
  lastDetection: {
    content: string | null;
    isDataMatrix: boolean;
    pattern: string;
    bounds: { x: number; y: number; width: number; height: number };
  } | null;
  currentGrade: QualityGrades['overall'] | null;
  currentGrades: QualityGrades | null;
  history: ScanRecord[];
  scanCount: number;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  error: string | null;
  frameRate: number;
}

export function useCamera(): UseCameraReturn {
  // Camera state
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [cameraConfig, setCameraConfigState] = useState<CameraConfig>({
    mode: 'webcam',
    resolution: { width: 1280, height: 720 },
    exposure: 50,
    gain: 50,
  });

  // Detection state
  const [lastDetection, setLastDetection] = useState<UseCameraReturn['lastDetection']>(null);
  const [currentGrade, setCurrentGrade] = useState<QualityGrades['overall'] | null>(null);
  const [currentGrades, setCurrentGrades] = useState<QualityGrades | null>(null);

  // History state
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [scanCount, setScanCount] = useState(0);

  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Performance tracking
  const [frameRate, setFrameRate] = useState(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const scanIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
    initAudioContext();
  }, []);

  // Enumerate cameras
  useEffect(() => {
    async function getCameras() {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);

        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to enumerate cameras:', err);
        setError('Failed to access camera. Please allow camera permissions.');
      }
    }

    getCameras();
  }, [selectedCamera]);

  // Calculate frame rate
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastFrameTimeRef.current) / 1000;
      if (elapsed >= 1) {
        setFrameRate(Math.round(frameCountRef.current / elapsed));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load history from IndexedDB
  const loadHistory = async () => {
    try {
      const records = await getAllScanRecords();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Process scan result
  const processScanResult = useCallback(async () => {
    if (!audioEnabled && !isAudioReady()) {
      resumeAudio();
    }

    const startTime = Date.now();

    // Simulate scan frame (in production, this would use actual camera feed)
    const frame = simulateScanFrame();

    if (frame.detected) {
      setLastDetection({
        content: frame.content,
        isDataMatrix: frame.isDataMatrix,
        pattern: frame.pattern,
        bounds: frame.bounds,
      });

      // Analyze the pattern
      const patternAnalysis = analyzePattern(frame.modules);
      const { grades } = analyzeDataMatrix(
        frame.modules,
        frame.contrast,
        frame.decodeQuality > 0.5,
        frame.pattern
      );

      // Recalculate grades based on actual pattern analysis
      const finderDamage = frame.isDataMatrix ? 0.2 : 1.0;
      const calculatedGrades = calculateISO15415Grades(
        frame.contrast,
        frame.decodeQuality,
        frame.modules,
        finderDamage
      );
      calculatedGrades.overall = calculateOverallGrade(calculatedGrades);

      setCurrentGrades(calculatedGrades);
      setCurrentGrade(calculatedGrades.overall);

      // Play audio alert for D and F grades
      if (audioEnabled && (calculatedGrades.overall === 'D' || calculatedGrades.overall === 'F')) {
        playGradeAlert(calculatedGrades.overall, volume);
      }

      // Create scan record
      const record: ScanRecord = {
        id: generateId(),
        timestamp: new Date(),
        dataMatrixContent: frame.content,
        grade: calculatedGrades.overall,
        grades: calculatedGrades,
        cameraMode: cameraConfig.mode,
        isDataMatrix: frame.isDataMatrix,
        detectedPattern: frame.pattern,
        processingTime: Date.now() - startTime,
      };

      // Save to history
      try {
        await addScanRecord(record);
        setHistory((prev) => [record, ...prev]);
        setScanCount((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to save scan record:', err);
      }
    } else {
      setLastDetection(null);
    }
  }, [audioEnabled, volume, cameraConfig.mode]);

  // Scanning control
  const startScanning = useCallback(async () => {
    if (isScanning) return;

    setError(null);
    resumeAudio();

    // For webcam mode, set up video stream
    if (cameraConfig.mode === 'webcam' && selectedCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera,
            width: { ideal: cameraConfig.resolution.width },
            height: { ideal: cameraConfig.resolution.height },
          },
        });

        // Store stream for cleanup
        (window as any).__cameraStream = stream;
      } catch (err) {
        console.error('Failed to start camera:', err);
        setError('Failed to start camera. Please check camera permissions.');
        return;
      }
    }

    setIsScanning(true);

    // Simulate continuous scanning (in production, use requestAnimationFrame with actual video)
    const scanLoop = () => {
      if (!isScanning) return;

      frameCountRef.current++;
      processScanResult();

      // Adjust scan interval based on camera mode
      const interval = cameraConfig.mode === 'industrial' ? 50 : 100;
      scanIntervalRef.current = window.setTimeout(scanLoop, interval);
    };

    scanLoop();
  }, [isScanning, cameraConfig.mode, selectedCamera, cameraConfig.resolution, processScanResult]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);

    if (scanIntervalRef.current) {
      clearTimeout(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    const stream = (window as any).__cameraStream;
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      delete (window as any).__cameraStream;
    }
  }, []);

  const toggleScanning = useCallback(() => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  }, [isScanning, startScanning, stopScanning]);

  const setCameraConfig = useCallback((config: Partial<CameraConfig>) => {
    setCameraConfigState((prev) => ({ ...prev, ...config }));
  }, []);

  return {
    isScanning,
    startScanning,
    stopScanning,
    toggleScanning,
    cameraConfig,
    setCameraConfig,
    availableCameras,
    selectedCamera,
    setSelectedCamera,
    lastDetection,
    currentGrade,
    currentGrades,
    history,
    scanCount,
    audioEnabled,
    setAudioEnabled,
    volume,
    setVolume,
    error,
    frameRate,
  };
}
