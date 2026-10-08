import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCcw, Check, AlertCircle } from 'lucide-react';

export default function StepLiveSelfie({ files, setFiles, onNext, onBack }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access required for selfie verification. Please allow permissions in your browser.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Fallback to client dimensions if video dimensions are 0
      canvas.width = video.videoWidth || video.clientWidth || 400;
      canvas.height = video.videoHeight || video.clientHeight || 400;
      const ctx = canvas.getContext('2d');
      
      // Draw image
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to file
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to capture image. Please try again.");
          return;
        }
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFiles({ ...files, selfie: file });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setFiles({ ...files, selfie: null });
    startCamera();
  };

  const handleNext = () => {
    stopCamera();
    onNext();
  };

  const handleBack = () => {
    stopCamera();
    onBack();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center">
      
      <div className="text-center mb-4">
        <Camera size={40} className="mx-auto text-[var(--color-primary-400)] mb-2" />
        <h3 className="font-semibold text-lg text-[var(--text-primary)]">Identity Verification</h3>
        <p className="text-sm text-[var(--text-muted)]">Take a live selfie to match with your ID proof.</p>
      </div>

      {error ? (
        <div className="bg-[var(--color-danger-100)] text-[var(--color-danger-600)] p-4 rounded-lg flex items-start gap-3 max-w-sm text-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="relative w-64 h-64 mx-auto">
          {/* Circular Frame Overlay */}
          <div className="absolute inset-0 z-10 border-[6px] border-[var(--bg-card)] rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
          
          {!stream && !capturedImage ? (
            <div className="w-full h-full bg-[var(--bg-surface)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <button 
                onClick={startCamera}
                className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg"
              >
                Open Camera
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover rounded-full" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-full transform -scale-x-100" 
            />
          )}
        </div>
      )}

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {stream && !capturedImage && (
        <button 
          onClick={capturePhoto}
          className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform"
        >
          Capture
        </button>
      )}

      {capturedImage && (
        <div className="flex gap-4">
          <button onClick={retakePhoto} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-full border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-sm font-medium">
            <RefreshCcw size={16} /> Retake
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-[var(--color-success-500)] text-white rounded-full shadow-[var(--shadow-success)] hover:bg-[var(--color-success-600)] transition-colors font-medium">
            Looks Good <Check size={18} />
          </button>
        </div>
      )}

      <div className="w-full flex gap-4 pt-8">
        <button type="button" onClick={handleBack} className="flex-1 bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-[10px] font-medium text-sm hover:bg-[var(--bg-surface)] transition-colors">
          Back
        </button>
        <button 
          type="button" 
          onClick={handleNext}
          disabled={!capturedImage}
          className="flex-1 bg-[var(--color-primary-500)] text-white py-3 rounded-[10px] font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
