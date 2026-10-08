import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  Check, AlertCircle, User, Phone, Calendar, HeartPulse, 
  Car, Bike, ArrowRight, ArrowLeft, UploadCloud, Camera, 
  RefreshCw, CheckCircle2, ShieldCheck, Loader2
} from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function DriverSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const [formData, setFormData] = useState({
    phone: '',
    dob: '',
    emergencyContact: '',
    vehicleType: 'CAR',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    yearOfManufacture: '',
  });

  const [files, setFiles] = useState({
    rcFront: null,
    rcBack: null,
    drivingLicence: null,
    idProof: null,
    vehiclePhoto: null,
    selfie: null,
  });

  const [filePreviews, setFilePreviews] = useState({});
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Webcam states
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  const steps = [
    { id: 1, title: 'Basic' },
    { id: 2, title: 'Vehicle' },
    { id: 3, title: 'Docs' },
    { id: 4, title: 'Selfie' },
    { id: 5, title: 'Review' },
  ];

  const nextStep = () => {
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }
      setFiles(prev => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Handlers
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Flip context horizontally if needed, though usually just drawn as is
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setSelfiePreview(imageDataUrl);
      
      // Convert to file object
      canvas.toBlob((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFiles(prev => ({ ...prev, selfie: file }));
      }, 'image/jpeg');

      stopCamera();
    }
  };

  const retakeSelfie = () => {
    setSelfiePreview(null);
    setFiles(prev => ({ ...prev, selfie: null }));
    startCamera();
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stopCamera();
    };
  }, [stream]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Submit Documents (Multipart)
      const docFormData = new FormData();
      const fileMap = {
        rcFront: 'rc_front',
        rcBack: 'rc_back',
        drivingLicence: 'driving_licence',
        idProof: 'id_proof',
        vehiclePhoto: 'vehicle_photo',
        selfie: 'selfie',
      };
      Object.keys(files).forEach(key => {
        if (files[key]) {
          docFormData.append(fileMap[key], files[key]);
          if (key === 'selfie') {
            docFormData.append('profile_photo', files[key]);
          }
        }
      });
      
      const docRes = await api.post('/drivers/upload-docs', docFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const urls = docRes.data.data;

      // 2. Submit Driver Profile Data with the received URLs
      const profileData = {
        ...formData,
        vehiclePhotoUrl: urls.vehiclePhotoUrl,
        idProofUrl: urls.idProofUrl,
        rcFrontUrl: urls.rcFrontUrl,
        rcBackUrl: urls.rcBackUrl,
        drivingLicenceUrl: urls.drivingLicenceUrl,
        selfieUrl: urls.selfieUrl,
      };

      await api.post('/drivers/profile', profileData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      let msg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      if (msg.includes('URL is required')) msg = 'Please make sure all documents and photos are uploaded.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-surface flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={48} className="text-primary" />
        </div>
        <h1 className="text-3xl font-display font-extrabold text-on-surface mb-3">Application Received!</h1>
        <p className="text-on-surface-variant font-medium">Your documents are under review. We will notify you once you are verified to offer rides.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface text-on-surface">
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0 pt-16 flex flex-col h-full overflow-y-auto">
        <div className="w-full max-w-md mx-auto p-6 flex flex-col min-h-full pb-safe">
          
          {/* Header & Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-2xl font-display font-extrabold text-on-surface tracking-tight leading-tight">Driver Setup</h1>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Step {step} of 5: {steps[step-1].title}</p>
              </div>
            </div>
            
            {/* Flat Progress Bar */}
            <div className="flex justify-between items-center gap-2">
              {steps.map((s) => (
                <div key={s.id} className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  {step >= s.id && (
                    <div className="h-full bg-primary w-full animate-in slide-in-from-left-full duration-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 flex items-start gap-3">
              <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-display font-extrabold text-on-surface mb-6">Basic Info</h2>
              
              <div className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={18} className="text-on-surface-variant" />
                    </div>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-on-surface-variant" />
                    </div>
                    <input 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Emergency Contact</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HeartPulse size={18} className="text-on-surface-variant" />
                    </div>
                    <input 
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="Family member's number"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full pt-8 mt-auto">
                <button 
                  onClick={nextStep}
                  disabled={!formData.phone || !formData.dob || !formData.emergencyContact}
                  className="w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE DETAILS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-display font-extrabold text-on-surface mb-6">Vehicle Details</h2>
              
              <div className="space-y-5">
                {/* Vehicle Type Selector */}
                <div>
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-3">Vehicle Type</label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, vehicleType: 'CAR'})}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.vehicleType === 'CAR' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}                    >
                      <Car size={32} className="mb-2" />
                      <span className="font-bold text-sm">Car</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, vehicleType: 'BIKE'})}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.vehicleType === 'BIKE' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
                    >
                      <Bike size={32} className="mb-2" />
                      <span className="font-bold text-sm">Bike</span>
                    </button>
                  </div>
                </div>

                {/* Make & Model */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Make (Brand)</label>
                    <input 
                      type="text"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-3.5 text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="e.g. Maruti"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Model</label>
                    <input 
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-3.5 text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="e.g. Swift"
                    />
                  </div>
                </div>

                {/* Reg Number */}
                <div>
                  <label className="block text-label-md font-semibold text-on-surface-variant mb-2">Registration Number</label>
                  <input 
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-3.5 text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase"
                    placeholder="MH 12 AB 1234"
                  />
                </div>
              </div>

              <div className="w-full pt-8 flex gap-3 mt-auto">
                <button type="button" onClick={prevStep} className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"><ArrowLeft size={20} /></button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleNumber}
                  className="flex-1 h-14 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD DOCS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-display font-extrabold text-on-surface mb-6">Upload Documents</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'rcFront', label: 'RC Front', desc: 'Registration Certificate Front' },
                  { key: 'rcBack', label: 'RC Back', desc: 'Registration Certificate Back' },
                  { key: 'drivingLicence', label: 'Driving Licence', desc: 'Front of your valid DL' },
                  { key: 'idProof', label: 'Aadhaar / PAN', desc: 'Any Govt ID proof' },
                  { key: 'vehiclePhoto', label: 'Vehicle Photo', desc: 'Clear photo showing Number Plate' },
                ].map((doc) => (
                  <div key={doc.key} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex gap-4 items-center">
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
                      {filePreviews[doc.key] ? (
                        <img src={filePreviews[doc.key]} alt={doc.label} className="w-full h-full object-cover" />
                      ) : (
                        <UploadCloud size={20} className="text-on-surface-variant/50" />
                      )}
                      
                      {/* Hidden file input */}
                      <input 
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, doc.key)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-on-surface truncate">{doc.label}</h4>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{doc.desc}</p>
                    </div>
                    
                    <div className="shrink-0">
                      {filePreviews[doc.key] ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 size={18} className="text-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant/50 pointer-events-none">
                          <Camera size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full pt-8 flex gap-3 mt-auto">
                <button type="button" onClick={prevStep} className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"><ArrowLeft size={20} /></button>
                <button 
                  onClick={nextStep}
                  disabled={!files.rcFront || !files.rcBack || !files.drivingLicence || !files.idProof || !files.vehiclePhoto}
                  className="flex-1 h-14 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LIVE SELFIE */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-display font-extrabold text-on-surface mb-2">Take a Selfie</h2>
              <p className="text-sm text-on-surface-variant mb-6">We need a clear photo of your face for verification.</p>
              
              {!stream && !selfiePreview && (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Camera size={40} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-on-surface mb-2">Camera Access Required</h3>
                  <p className="text-sm text-on-surface-variant text-center max-w-[250px] mb-8">Please allow camera access to take your profile picture.</p>
                  
                  <button onClick={startCamera} className="px-8 py-3.5 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary transition-all hover:opacity-90 active:scale-[0.98]">
                    Open Camera
                  </button>
                </div>
              )}

              {stream && !selfiePreview && (
                <div className="flex flex-col items-center flex-1">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-black mt-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Minimalist scanner effect */}
                    <div className="absolute inset-0 border-[4px] border-dashed border-white/30 rounded-full pointer-events-none animate-[spin_20s_linear_infinite]"></div>
                    {/* Face guide */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[65%] border-2 border-white/50 rounded-[40%] mx-8 pointer-events-none"></div>
                  </div>
                  <p className="mt-6 text-sm font-bold text-primary">Position your face in the oval</p>
                  
                  <button onClick={captureSelfie} className="mt-8 w-20 h-20 rounded-full bg-surface border-4 border-primary flex items-center justify-center hover:scale-95 transition-transform active:scale-90 shadow-lg shadow-primary/20">
                    <div className="w-14 h-14 rounded-full bg-primary"></div>
                  </button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {selfiePreview && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-primary mt-4 mb-8 relative shadow-lg shadow-primary/20">
                    <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex gap-3 w-full">
                    <button onClick={retakeSelfie} className="flex-1 py-4 rounded-full font-bold text-sm bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">
                      Retake
                    </button>
                    <button onClick={nextStep} className="flex-1 py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary transition-all hover:opacity-90 active:scale-[0.98]">
                      Looks Good <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {(!stream && !selfiePreview) && (
                <div className="w-full pt-8 flex gap-3 mt-auto">
                  <button type="button" onClick={prevStep} className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"><ArrowLeft size={20} /></button>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-display font-extrabold text-on-surface mb-6">Review & Submit</h2>
              
              <div className="space-y-4 mb-8">
                {/* Basic Summary */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-on-surface">Basic Details</h3>
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-medium">
                    <span className="text-on-surface-variant">Name:</span> <span className="text-on-surface text-right">{user?.name}</span>
                    <span className="text-on-surface-variant">Phone:</span> <span className="text-on-surface text-right">{formData.phone}</span>
                  </div>
                </div>

                {/* Vehicle Summary */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-on-surface">Vehicle Details</h3>
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-medium">
                    <span className="text-on-surface-variant">Type:</span> <span className="text-on-surface text-right">{formData.vehicleType}</span>
                    <span className="text-on-surface-variant">Reg No:</span> <span className="text-on-surface text-right">{formData.vehicleNumber}</span>
                    <span className="text-on-surface-variant">Model:</span> <span className="text-on-surface text-right">{formData.vehicleMake} {formData.vehicleModel}</span>
                  </div>
                </div>

                {/* Documents Summary Grid */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-on-surface">Documents</h3>
                    <button onClick={() => setStep(3)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'rcFront', label: 'RC' },
                      { key: 'idProof', label: 'ID' },
                      { key: 'drivingLicence', label: 'DL' },
                      { key: 'vehiclePhoto', label: 'Vehicle' },
                      { key: 'selfie', label: 'Selfie' },
                    ].map(doc => (
                      <div key={doc.key} className="flex flex-col items-center gap-1">
                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant bg-surface-container">
                          {filePreviews[doc.key] || (doc.key === 'selfie' && selfiePreview) ? (
                            <img src={filePreviews[doc.key] || selfiePreview} alt={doc.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-on-surface-variant/50 font-bold">Missing</div>
                          )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{doc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-8">
                <button 
                  type="button"
                  onClick={() => setTermsAgreed(!termsAgreed)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors mt-0.5 border ${termsAgreed ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant'}`}
                >
                  {termsAgreed && <Check size={14} strokeWidth={4} />}
                </button>
                <p className="text-[12px] text-on-surface-variant font-medium leading-relaxed">
                  I confirm that all provided documents are genuine and belong to me. I agree to a background verification check by PodGo.
                </p>
              </div>

              <div className="w-full flex gap-3 mt-auto">
                <button type="button" onClick={prevStep} disabled={loading} className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"><ArrowLeft size={20} /></button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || !termsAgreed}
                  className="flex-1 h-14 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-on-primary disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <><ShieldCheck size={18} /> Submit</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


