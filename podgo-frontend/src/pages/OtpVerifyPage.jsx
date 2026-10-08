import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, CarFront, Mail } from 'lucide-react';
import AuthLayout from '../components/layouts/AuthLayout';
import Button from '../components/common/Button';
import './OtpVerifyPage.css';

export default function OtpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setCredentials = useAuthStore(state => state.setCredentials);
  
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [shake, setShake] = useState(false);
  const [currentState, setCurrentState] = useState('input'); // 'input', 'verifying', 'success'
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0 && currentState === 'input') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, currentState]);

  useEffect(() => {
    if (currentState === 'input') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 80);
    }
  }, [currentState]);

  const handleChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue && value !== '') return;

    if (error) setError('');

    const newOtp = [...otp];

    if (numericValue.length > 1) {
      const pastedData = numericValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (numericValue !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (otp[index] !== '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
      if (error) setError('');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      if (otp.join('').length === 6) {
        verifyOtp();
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setCountdown(45);
    setError('');
    
    try {
      await api.post('/auth/resend-otp', { email });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => {
      setShake(true);
      setTimeout(() => setShake(false), 650);
    }, 10);
  };

  const verifyOtp = async () => {
    if (currentState !== 'input') return;

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      triggerShake();
      return;
    }

    setCurrentState('verifying');

    try {
      const [response] = await Promise.all([
        api.post('/auth/verify-otp', { email, otp: otpValue }),
        new Promise(resolve => setTimeout(resolve, 1600))
      ]);

      if (response.data.success) {
        setCurrentState('success');
        const { token, id, name, role, email: userEmail } = response.data.data;
        setCredentials({ id, email: userEmail, name, role }, token);
        
        setTimeout(() => {
          if (role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      setCurrentState('input');
      setError(err.response?.data?.message || 'Verification failed');
      triggerShake();
    }
  };

  if (!email) return null;

  return (
    <AuthLayout>
      {/* Top Header */}
      <div className="flex items-center justify-between w-full mt-4 mb-8">
        <button 
          onClick={() => navigate('/login')}
          className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="inline-flex items-center gap-1.5 bg-surface-container-high/60 backdrop-blur-md rounded-lg p-1.5 active:scale-95 transition-transform absolute left-1/2 -translate-x-1/2">
          <div className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center text-on-primary-container">
            <CarFront size={14} />
          </div>
          <span className="font-display font-bold text-label-lg text-on-surface pr-1 tracking-tight">PodGo</span>
        </div>
        
        <div className="w-11 h-11" /> {/* Spacer for centering */}
      </div>

      <div className="w-full bg-surface-container/80 backdrop-blur-xl rounded-[16px] p-space-lg shadow-xl border border-outline-variant/20 flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
        
        {currentState === 'input' && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="w-[72px] h-[72px] rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Mail size={32} />
            </div>

            <h1 className="font-display text-headline-md text-on-surface tracking-tight mb-2">Check your inbox</h1>
            <p className="text-body-md text-on-surface-variant text-center mb-8">
              We sent a 6-digit verification code to<br />
              <span className="font-semibold text-on-surface">{email}</span>
            </p>

            <div className={`flex gap-2 justify-center mb-6 w-full ${shake ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}`}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setError('')}
                  aria-label={`OTP digit ${index + 1}`}
                  className={`
                    w-11 h-14 bg-surface-container rounded-[10px] border-2 text-center text-headline-sm font-bold text-on-surface
                    transition-all outline-none focus:outline-none focus:ring-1 focus:ring-primary/30
                    ${error ? 'border-error focus:border-error focus:ring-error/30 text-error' : 'border-outline-variant focus:border-primary'}
                    ${digit ? 'border-primary/50' : ''}
                  `}
                />
              ))}
            </div>

            {error && (
              <p className="text-body-sm text-error mb-4 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <button 
              onClick={handleResend}
              disabled={countdown > 0}
              className={`text-body-md mb-8 transition-colors ${countdown === 0 ? 'text-secondary hover:underline cursor-pointer font-medium' : 'text-on-surface-variant'}`}
            >
              {countdown === 0 
                ? "Didn't receive the code? Resend OTP" 
                : (
                  <span>
                    Didn't receive the code? Resend in <span className="text-secondary font-medium">{String(countdown).padStart(2, "0")}s</span>
                  </span>
                )}
            </button>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full mb-6"
              disabled={otp.join('').length !== 6}
              onClick={verifyOtp}
            >
              Verify Code
            </Button>

            <Link to="/register" className="text-label-md text-on-surface-variant hover:text-on-surface hover:underline">
              Wrong email?
            </Link>
          </div>
        )}

        {/* Existing Animation logic remains wrapped inside */}
        {currentState === 'verifying' && (
          <div className="verification-wrap">
            <div className="verification-status">ESTABLISHING CONNECTION</div>
            <div className="verification-stage">
              <div className="verification-ring one"></div>
              <div className="verification-ring two"></div>
              <div className="verification-ring three"></div>
              <div className="verification-core"></div>
              <div className="orbit-system">
                {otp.map((digit, index) => (
                  <div key={index} className={`orbit-number orbit-${index + 1}`}>
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentState === 'success' && (
          <div className="success-wrap">
            <div className="success-card">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7"></polyline>
                </svg>
              </div>
              <div className="success-title">OTP VERIFIED</div>
              <div className="success-subtitle">VERIFICATION SUCCESSFUL</div>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </AuthLayout>
  );
}