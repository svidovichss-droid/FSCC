// Camera Feed Display Component
import React, { useRef, useEffect } from 'react';

interface CameraFeedProps {
  isScanning: boolean;
  mode: 'industrial' | 'webcam';
  selectedCamera: string | null;
  lastDetection: {
    content: string | null;
    isDataMatrix: boolean;
    pattern: string;
    bounds: { x: number; y: number; width: number; height: number };
  } | null;
  frameRate: number;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  isScanning,
  mode,
  selectedCamera,
  lastDetection,
  frameRate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up video stream when scanning starts
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startStream() {
      if (isScanning && mode === 'webcam' && selectedCamera && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: selectedCamera,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (err) {
          console.error('Failed to start video stream:', err);
        }
      }
    }

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScanning, mode, selectedCamera]);

  // Draw detection overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !lastDetection) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { bounds, isDataMatrix, pattern } = lastDetection;

    if (bounds.width > 0 && bounds.height > 0) {
      // Scale bounds to container size
      const scaleX = canvas.width / 800;
      const scaleY = canvas.height / 600;

      const scaledBounds = {
        x: bounds.x * scaleX,
        y: bounds.y * scaleY,
        width: bounds.width * scaleX,
        height: bounds.height * scaleY,
      };

      // Draw bounding box
      ctx.strokeStyle = isDataMatrix ? '#22c55e' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        scaledBounds.x,
        scaledBounds.y,
        scaledBounds.width,
        scaledBounds.height
      );

      // Draw label
      ctx.fillStyle = isDataMatrix ? '#22c55e' : '#f59e0b';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText(
        isDataMatrix ? `DataMatrix: ${pattern}` : `Not DataMatrix: ${pattern}`,
        scaledBounds.x,
        scaledBounds.y - 5
      );
    }
  }, [lastDetection]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-700/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-200">
            {mode === 'industrial' ? 'Industrial Camera' : 'Webcam'}
          </h2>
          <span className="px-2 py-0.5 text-xs bg-blue-600/30 text-blue-400 rounded">
            {mode === 'industrial' ? 'GigE/USB3' : 'USB Webcam'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          {isScanning && (
            <>
              <span>{frameRate} FPS</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>LIVE</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video/Canvas Container */}
      <div
        ref={containerRef}
        className="relative aspect-video bg-slate-900 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        {isScanning && mode === 'webcam' ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
        ) : (
          <>
            {/* Simulated camera feed (placeholder) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isScanning ? (
                <>
                  {/* Grid overlay for simulated feed */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-slate-600" />
                    ))}
                  </div>

                  {/* Detection simulation */}
                  {lastDetection && lastDetection.bounds.width > 0 && (
                    <div
                      className={`absolute border-2 rounded ${
                        lastDetection.isDataMatrix ? 'border-green-500' : 'border-amber-500'
                      }`}
                      style={{
                        left: `${(lastDetection.bounds.x / 800) * 100}%`,
                        top: `${(lastDetection.bounds.y / 600) * 100}%`,
                        width: `${(lastDetection.bounds.width / 800) * 100}%`,
                        height: `${(lastDetection.bounds.height / 600) * 100}%`,
                        backgroundColor: lastDetection.isDataMatrix
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                      }}
                    >
                      <span
                        className={`absolute -top-6 left-0 px-2 py-0.5 text-xs rounded ${
                          lastDetection.isDataMatrix
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {lastDetection.isDataMatrix ? 'DataMatrix' : lastDetection.pattern}
                      </span>
                    </div>
                  )}

                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-0.5 bg-green-500/50 animate-scan-line" />
                  </div>
                </>
              ) : (
                <>
                  <svg
                    className="w-24 h-24 text-slate-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-slate-500 text-sm">Camera feed preview</p>
                  <p className="text-slate-600 text-xs mt-2">
                    Press Start to begin scanning
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Status bar */}
      {lastDetection && (
        <div className="p-3 border-t border-slate-700 bg-slate-700/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  lastDetection.isDataMatrix
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-amber-900/50 text-amber-400'
                }`}
              >
                {lastDetection.isDataMatrix ? 'DataMatrix' : lastDetection.pattern}
              </span>
            </div>
            {lastDetection.content && (
              <span className="text-slate-300 font-mono">
                {lastDetection.content}
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};
