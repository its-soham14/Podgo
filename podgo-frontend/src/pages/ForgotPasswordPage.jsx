import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '../components/layouts/AuthLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './OtpVerifyPage.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  
  // Step 2 states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentState, setCurrentState] = useState('input'); // input, verifying, success
  const [shake, setShake] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast.success("OTP sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (currentState !== 'input') return;

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      triggerShake();
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setCurrentState('verifying');
    setError('');

    try {
      const [response] = await Promise.all([
        api.post('/auth/reset-password', { email, otp: otpValue, newPassword }),
        new Promise(resolve => setTimeout(resolve, 1600))
      ]);

      setCurrentState('success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err) {
      setCurrentState('input');
      setError(err.response?.data?.message || 'Failed to reset password');
      triggerShake();
    }
  };

  // OTP handlers
  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue && value !== '') return;
    if (error) setError('');

    const newOtp = [...otp];
    if (numericValue.length > 1) {
      const pastedData = numericValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) newOtp[i] = pastedData[i] || '';
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

  const handleOtpKeyDown = (index, e) => {
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
    }
  };

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => {
      setShake(true);
      setTimeout(() => setShake(false), 650);
    }, 10);
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div className="flex items-center justify-between w-full mt-4 mb-6 relative">
        <button 
          onClick={() => {
            if (step === 2 && currentState === 'input') setStep(1);
            else navigate('/login');
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all z-10"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full bg-surface-container/80 backdrop-blur-xl rounded-[16px] p-space-lg shadow-xl border border-outline-variant/20 flex-1 flex flex-col relative min-h-[400px]">
        
        {step === 1 && (
          <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500 w-full h-full">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container mb-4">
                <KeyRound size={32} />
              </div>
              <h1 className="font-display text-headline-lg text-on-surface tracking-tight mb-2">Reset Password</h1>
              <p className="text-body-md text-on-surface-variant text-center max-w-[280px]">
                Enter your email address to receive a verification code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-6 w-full flex-1">
              <Input 
                label="Email"
                type="email"
                icon={Mail}
                placeholder="hello@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-body-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full mt-auto mb-2">
                Send OTP
              </Button>
            </form>
          </div>
        )}

        {step === 2 && currentState === 'input' && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in slide-in-from-right-4 duration-500">
            
            <h1 className="font-display text-headline-md text-on-surface tracking-tight mb-2 mt-2">Secure Reset</h1>
            <p className="text-body-md text-on-surface-variant text-center mb-6">
              Enter the 6-digit code sent to <br/>
              <span className="font-semibold text-on-surface">{email}</span>
            </p>

            <form onSubmit={handleResetPassword} className="w-full flex flex-col flex-1">
              <div className="flex flex-col items-center">
                {/* OTP Boxes */}
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onFocus={() => setError('')}
                      className={`
                        w-11 h-14 bg-surface-container-high rounded-[10px] border-2 text-center text-headline-sm font-bold text-on-surface
                        transition-all outline-none focus:outline-none focus:ring-1 focus:ring-primary/30
                        ${error ? 'border-error focus:border-error focus:ring-error/30 text-error' : 'border-outline-variant focus:border-primary'}
                        ${digit ? 'border-primary/50' : ''}
                      `}
                    />
                  ))}
                </div>

                <div className="w-full mb-6 relative">
                  <Input 
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    icon={Lock}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-body-sm animate-in fade-in slide-in-from-top-2 mb-4">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full mt-auto mb-2"
                disabled={otp.join('').length !== 6 || newPassword.length < 6}
              >
                Reset Password
              </Button>
            </form>
          </div>
        )}

        {/* Animation logic for Verification Phase */}
        {step === 2 && currentState === 'verifying' && (
          <div className="verification-wrap absolute inset-0 flex items-center justify-center rounded-[16px] bg-surface-container/80 backdrop-blur-md z-20">
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

        {step === 2 && currentState === 'success' && (
          <div className="success-wrap absolute inset-0 flex items-center justify-center rounded-[16px] bg-surface-container/80 backdrop-blur-md z-20">
            <div className="success-card">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7"></polyline>
                </svg>
              </div>
              <div className="success-title">RESET COMPLETE</div>
              <div className="success-subtitle">PASSWORD UPDATED</div>
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
