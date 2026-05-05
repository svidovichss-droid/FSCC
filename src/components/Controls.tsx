// Controls Panel Component
import React from 'react';
import type { CameraConfig } from '../types';

interface ControlsProps {
  isScanning: boolean;
  onToggleScanning: () => void;
  cameraConfig: CameraConfig;
  onCameraConfigChange: (config: Partial<CameraConfig>) => void;
  availableCameras: { deviceId: string; label: string }[];
  selectedCamera: string | null;
  onSelectedCameraChange: (deviceId: string | null) => void;
  audioEnabled: boolean;
  onAudioEnabledChange: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  scanCount: number;
  error: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
  isScanning,
  onToggleScanning,
  cameraConfig,
  onCameraConfigChange,
  availableCameras,
  selectedCamera,
  onSelectedCameraChange,
  audioEnabled,
  onAudioEnabledChange,
  volume,
  onVolumeChange,
  scanCount,
  error,
}) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200">Controls</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Main Scan Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={onToggleScanning}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isScanning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isScanning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                STOP SCANNING
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                START SCANNING
              </span>
            )}
          </button>

          {/* Scan Counter */}
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold text-slate-200">{scanCount}</span>
            <p className="text-sm text-slate-400">Total Scans</p>
          </div>
        </div>

        {/* Camera Mode Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Camera Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCameraConfigChange({ mode: 'industrial' })}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                cameraConfig.mode === 'industrial'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <span>Industrial</span>
              </div>
            </button>
            <button
              onClick={() => onCameraConfigChange({ mode: 'webcam' })}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                cameraConfig.mode === 'webcam'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Webcam</span>
              </div>
            </button>
          </div>
        </div>

        {/* Camera Selection (Webcam mode) */}
        {cameraConfig.mode === 'webcam' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Select Camera
            </label>
            <select
              value={selectedCamera || ''}
              onChange={(e) => onSelectedCameraChange(e.target.value || null)}
              className="w-full bg-slate-700 text-slate-200 text-sm rounded p-2 border border-slate-600"
            >
              <option value="">Select a camera...</option>
              {availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Resolution */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Resolution
          </label>
          <select
            value={`${cameraConfig.resolution.width}x${cameraConfig.resolution.height}`}
            onChange={(e) => {
              const [width, height] = e.target.value.split('x').map(Number);
              onCameraConfigChange({ resolution: { width, height } });
            }}
            className="w-full bg-slate-700 text-slate-200 text-sm rounded p-2 border border-slate-600"
          >
            <option value="640x480">640 x 480</option>
            <option value="1280x720">1280 x 720 (HD)</option>
            <option value="1920x1080">1920 x 1080 (Full HD)</option>
          </select>
        </div>

        {/* Audio Controls */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => onAudioEnabledChange(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  audioEnabled ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    audioEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-300">
              Audio Alerts (D/F zones)
            </span>
          </label>

          {audioEnabled && (
            <div className="space-y-2 pl-4">
              <label className="block text-xs text-slate-400">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* ISO Information */}
        <div className="p-3 bg-slate-700/50 rounded-lg text-xs text-slate-400">
          <p className="font-medium text-slate-300 mb-1">ISO 15415 Standard</p>
          <p>
            Grades A-D based on symbol contrast, decode ability, modulation, and other
            parameters. Grade F indicates failure or non-DataMatrix patterns.
          </p>
        </div>
      </div>
    </div>
  );
};
