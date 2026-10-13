import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Upload
} from 'lucide-react';
import { FashionColor } from '../types';
import { FASHION_COLORS } from '../data/fashionData';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (imageDataUrl: string, matchedColor?: FashionColor) => void;
}

// Helper to compute color distance
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  if (cleanHex.length === 3) {
    const r = ((bigint >> 8) & 0xf) * 17;
    const g = ((bigint >> 4) & 0xf) * 17;
    const b = (bigint & 0xf) * 17;
    return { r, g, b };
  }
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

export const findClosestFashionColor = (r: number, g: number, b: number): FashionColor => {
  let closest = FASHION_COLORS[0];
  let minDistance = Infinity;

  for (const color of FASHION_COLORS) {
    const cRgb = hexToRgb(color.hex);
    // Weighted Euclidean RGB distance for human eye perception
    const dist =
      0.3 * Math.pow(r - cRgb.r, 2) +
      0.59 * Math.pow(g - cRgb.g, 2) +
      0.11 * Math.pow(b - cRgb.b, 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }

  return closest;
};

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [detectedColor, setDetectedColor] = useState<FashionColor | null>(null);
  const [detectedRgb, setDetectedRgb] = useState<{ r: number; g: number; b: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Detect camera devices
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // Ignore enumeration errors
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (targetFacing: 'environment' | 'user') => {
    setIsLoadingCamera(true);
    setErrorMessage(null);
    stopStream();

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setErrorMessage(
        'Camera API (getUserMedia) is not available or supported in this browser context (requires HTTPS or localhost). You can still upload or take a photo using the file picker below.'
      );
      setIsLoadingCamera(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing },
          audio: false
        });
      } catch (firstErr: any) {
        const isPolicyOrPermission =
          firstErr?.name === 'SecurityError' ||
          firstErr?.name === 'NotAllowedError' ||
          firstErr?.name === 'PermissionDeniedError' ||
          (typeof firstErr?.message === 'string' &&
            firstErr.message.toLowerCase().includes('permissions policy'));

        if (isPolicyOrPermission) {
          throw firstErr;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play was interrupted or video auto-started
        }
      }
      setIsLoadingCamera(false);
    } catch (err: any) {
      setIsLoadingCamera(false);

      const errName = err?.name || '';
      const errMsg = typeof err?.message === 'string' ? err.message : '';
      const isPolicyViolation =
        errName === 'SecurityError' ||
        errMsg.toLowerCase().includes('permissions policy') ||
        errMsg.toLowerCase().includes('permission policy') ||
        errMsg.toLowerCase().includes('not allowed in this document') ||
        errMsg.toLowerCase().includes('policy violation');

      if (isPolicyViolation) {
        setErrorMessage(
          'Permissions Policy Restriction: Camera access is blocked by the iframe/document permissions policy in this preview environment. The host container does not allow camera capture in this frame. Please test the app by opening the URL directly in a full browser tab, or use the file picker.'
        );
      } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera permission was denied. Please allow camera access in your browser settings, or use the file picker to take/upload a photo.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorMessage(
          'No camera device was found on this system. You can upload an existing garment photo instead.'
        );
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setErrorMessage(
          'Camera hardware is currently in use by another application. Please release the camera and try again, or use the file picker.'
        );
      } else {
        setErrorMessage(
          errMsg ||
            'Unable to initialize camera. You can capture or upload a garment photo using your device file picker.'
        );
      }
    }
  }, [stopStream]);

  // Handle open/close and facing mode changes
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setDetectedColor(null);
      setDetectedRgb(null);
      checkCameraDevices();
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedPhoto(null);
      setDetectedColor(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream, checkCameraDevices]);

  // Toggle front/back cameras
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    // Scale down proportionally to max 900px for high clarity and lightweight size
    const maxDim = 900;
    let targetW = width;
    let targetH = height;
    if (targetW > maxDim || targetH > maxDim) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    // If user-facing mode, mirror horizontally for natural preview
    if (facingMode === 'user') {
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, targetW, targetH);

    // Reset transform for subsequent operations
    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Sample central zone (40% width x 40% height) to extract dominant color
    const sampleBoxW = Math.round(targetW * 0.4);
    const sampleBoxH = Math.round(targetH * 0.4);
    const sampleStartX = Math.round((targetW - sampleBoxW) / 2);
    const sampleStartY = Math.round((targetH - sampleBoxH) / 2);

    try {
      const imageData = ctx.getImageData(sampleStartX, sampleStartY, sampleBoxW, sampleBoxH);
      const data = imageData.data;
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;

      // Sample every 4th pixel for speed
      for (let i = 0; i < data.length; i += 16) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
        count++;
      }

      if (count > 0) {
        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);
        setDetectedRgb({ r: avgR, g: avgG, b: avgB });
        const matched = findClosestFashionColor(avgR, avgG, avgB);
        setDetectedColor(matched);
      }
    } catch {
      // Ignore image data sampling error (cross-origin or canvas security)
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
    setCapturedPhoto(dataUrl);

    // Pause video feed tracks while previewing photo
    stopStream();
  };

  // Discard captured photo and retake
  const handleRetake = () => {
    setCapturedPhoto(null);
    setDetectedColor(null);
    setDetectedRgb(null);
    startCamera(facingMode);
  };

  // Confirm photo and send back to wardrobe form
  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return;
    onPhotoCaptured(capturedPhoto, detectedColor || undefined);
    onClose();
  };

  // Fallback file input handler (with capture="environment" for native camera support)
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setCapturedPhoto(dataUrl);

          // Extract color from center
          try {
            const sampleW = Math.round(w * 0.4);
            const sampleH = Math.round(h * 0.4);
            const imgData = ctx.getImageData(
              Math.round((w - sampleW) / 2),
              Math.round((h - sampleH) / 2),
              sampleW,
              sampleH
            );
            const d = imgData.data;
            let tr = 0;
            let tg = 0;
            let tb = 0;
            let c = 0;
            for (let i = 0; i < d.length; i += 16) {
              tr += d[i];
              tg += d[i + 1];
              tb += d[i + 2];
              c++;
            }
            if (c > 0) {
              const matched = findClosestFashionColor(
                Math.round(tr / c),
                Math.round(tg / c),
                Math.round(tb / c)
              );
              setDetectedColor(matched);
            }
          } catch {
            // Ignore sampling error
          }
        } else {
          setCapturedPhoto(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div className="bg-[#141413] text-[#FAF8F5] rounded-xs border border-[#33302B] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#292723] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#24221E] border border-[#3D3830] flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#D8B48D]" />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-base font-serif font-medium tracking-tight">
                {capturedPhoto ? 'Review Garment Photo' : 'Device Camera Viewfinder'}
              </h3>
              <p className="text-[11px] text-[#A69E90]">
                {capturedPhoto
                  ? 'Confirm garment capture and auto-detected palette'
                  : 'Capture real-life garments to add to your capsule wardrobe'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 text-[#A69E90] hover:text-white rounded-xs hover:bg-[#24221E] transition-colors"
            aria-label="Close camera modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative bg-[#0A0A09] flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[380px] overflow-hidden select-none">
          {/* Shutter Flash Animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />
          )}

          {capturedPhoto ? (
            /* Review Captured Photo */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={capturedPhoto}
                alt="Captured garment preview"
                className="max-h-[360px] w-auto max-w-full object-contain rounded-xs border border-[#33302B] shadow-lg"
              />
              {detectedColor && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#211F1B] border border-[#3D3930] rounded-xs text-xs text-[#FAF8F5]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B48D]" />
                  <span>Detected Color Foundation:</span>
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: detectedColor.hex }}
                  />
                  <span className="font-medium text-[#FAF8F5]">{detectedColor.name}</span>
                </div>
              )}
            </div>
          ) : errorMessage ? (
            /* Camera Permission or Error State */
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#2A1D1A] border border-[#522923] flex items-center justify-center text-[#E06D53]">
                <CameraOff className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FAF8F5] mb-1">
                  Camera Access Not Available
                </h4>
                <p className="text-xs text-[#A69E90] leading-relaxed">{errorMessage}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-white text-[#141413] text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose or Snap Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFallbackFile}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#24221E] hover:bg-[#33302B] text-[#FAF8F5] text-xs rounded-xs transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Stream with Luxury Viewfinder Overlay */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full max-h-[420px] object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Framing Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-full max-w-xs aspect-square border border-dashed border-white/25 rounded-xs flex items-center justify-center">
                  {/* Luxury Reticle Corners */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#D8B48D]" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#D8B48D]" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#D8B48D]" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#D8B48D]" />

                  {/* Centering crosshair */}
                  <div className="w-2.5 h-2.5 border-t border-l border-white/40" />

                  {/* Prompt Text */}
                  <div className="absolute bottom-2 text-center px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded-xs text-[10px] text-white/80">
                    Align garment in center frame
                  </div>
                </div>
              </div>

              {/* Loading Indicator */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#D8B48D] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#FAF8F5]">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Viewfinder Controls & Actions */}
        <div className="px-5 py-4 bg-[#1A1916] border-t border-[#292723] flex items-center justify-between gap-3 shrink-0">
          {capturedPhoto ? (
            /* Controls after photo captured */
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs text-[#FAF8F5] bg-[#292723] hover:bg-[#3D3A34] rounded-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#141413] bg-[#FAF8F5] hover:bg-white rounded-xs transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Use This Garment Photo</span>
              </button>
            </>
          ) : (
            /* Live Camera Controls */
            <>
              {/* Camera Switch / Native File Upload Fallback */}
              <div className="flex items-center gap-2">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    disabled={isLoadingCamera}
                    className="p-2.5 text-[#A69E90] hover:text-white bg-[#24221E] hover:bg-[#33302B] rounded-xs transition-colors disabled:opacity-40"
                    title="Flip camera (front / back)"
                    aria-label="Flip camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}

                <label
                  className="p-2.5 text-[#A69E90] hover:text-white bg-[#24221E] hover:bg-[#33302B] rounded-xs cursor-pointer transition-colors inline-flex items-center"
                  title="Upload from device storage instead"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFallbackFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Shutter Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={isLoadingCamera || !!errorMessage}
                  className="w-14 h-14 rounded-full border-3 border-white/80 hover:border-white p-1 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-md focus:outline-hidden"
                  aria-label="Take garment photo"
                >
                  <div className="w-full h-full rounded-full bg-[#FAF8F5] hover:bg-white transition-colors" />
                </button>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="text-xs text-[#A69E90] hover:text-white px-3 py-2 rounded-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
