// DataMatrix Quality Scanner - ISO 15415 Main Application
import React, { useState } from 'react';
import { CameraFeed, GradeDisplay, Controls, HistoryTable } from './components';
import { useCamera } from './hooks/useCamera';
import { getStatistics } from './utils/storage';

function App() {
  const {
    isScanning,
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
  } = useCamera();

  const [showStats, setShowStats] = useState(false);

  // Refresh history callback
  const handleRefreshHistory = async () => {
    // History is managed in hook
  };

  const stats = getStatistics(history);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-100">
                    DataMatrix Quality Scanner
                  </h1>
                  <p className="text-sm text-slate-400">
                    ISO 15415 Compliant | Industrial Grade
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="grid grid-cols-6 gap-4 text-center">
              <div>
                <span className="text-2xl font-bold text-slate-100">{stats.total}</span>
                <p className="text-xs text-slate-400">Total Scans</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-500">{stats.gradeDistribution.A}</span>
                <p className="text-xs text-slate-400">Grade A</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-lime-500">{stats.gradeDistribution.B}</span>
                <p className="text-xs text-slate-400">Grade B</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-500">{stats.gradeDistribution.C + stats.gradeDistribution.D}</span>
                <p className="text-xs text-slate-400">Grade C/D</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-500">{stats.gradeDistribution.F}</span>
                <p className="text-xs text-slate-400">Grade F</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-500">{stats.dataMatrixRate.toFixed(1)}%</span>
                <p className="text-xs text-slate-400">DataMatrix Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Camera + Grade */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Camera Feed */}
            <CameraFeed
              isScanning={isScanning}
              mode={cameraConfig.mode}
              selectedCamera={selectedCamera}
              lastDetection={lastDetection}
              frameRate={frameRate}
            />

            {/* Grade Display */}
            <GradeDisplay
              grade={currentGrade}
              grades={currentGrades}
              isScanning={isScanning}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6">
              <Controls
                isScanning={isScanning}
                onToggleScanning={toggleScanning}
                cameraConfig={cameraConfig}
                onCameraConfigChange={setCameraConfig}
                availableCameras={availableCameras}
                selectedCamera={selectedCamera}
                onSelectedCameraChange={setSelectedCamera}
                audioEnabled={audioEnabled}
                onAudioEnabledChange={setAudioEnabled}
                volume={volume}
                onVolumeChange={setVolume}
                scanCount={scanCount}
                error={error}
              />
            </div>
          </div>

          {/* Bottom - History Table */}
          <div className="col-span-12">
            <HistoryTable
              history={history}
              onRefresh={handleRefreshHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          <p>
            DataMatrix Quality Scanner v1.0 | ISO 15415:2011 Compliant
          </p>
          <p className="mt-1">
            Supports Industrial Cameras (GigE/USB3) and Webcam Interfaces
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
