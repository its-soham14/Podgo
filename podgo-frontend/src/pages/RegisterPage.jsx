import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CarFront, Check } from 'lucide-react';
import AuthLayout from '../components/layouts/AuthLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Service");
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      console.error("Full Registration Error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(formData.password);
  
  const getStrengthLabel = () => {
    if (strength === 0) return { label: '', color: '' };
    if (strength === 1) return { label: 'Weak', color: 'text-error' };
    if (strength === 2) return { label: 'Fair', color: 'text-warning' };
    if (strength === 3) return { label: 'Good', color: 'text-secondary' };
    return { label: 'Strong', color: 'text-secondary' };
  };

  const strengthData = getStrengthLabel();

  return (
    <AuthLayout>
      {/* Top Logo and Chip */}
      <div className="flex flex-col items-center gap-4 mt-8 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-2 bg-surface-container-high/60 backdrop-blur-md rounded-xl p-2 active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <CarFront size={18} />
          </div>
          <span className="font-display font-bold text-title-md text-on-surface pr-2 tracking-tight">PodGo</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-label-sm text-secondary uppercase tracking-[0.05em] font-bold">Secure Login • Encrypted</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full bg-surface-container/80 backdrop-blur-xl rounded-[16px] p-space-lg shadow-xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="font-display text-headline-lg text-on-surface tracking-tight mb-2">Create account</h1>
          <p className="text-body-md text-on-surface-variant">Join the commuter community</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input 
            label="Full Name"
            type="text"
            icon={User}
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <Input 
            label="Email"
            type="email"
            icon={Mail}
            placeholder="hello@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          
          <div className="relative">
            <Input 
              label="Password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              placeholder="••••••••"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <div className="flex items-center gap-3 mt-2 px-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(idx => (
                    <div 
                      key={idx} 
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength >= idx 
                          ? (strength === 1 ? 'bg-error' : strength === 2 ? 'bg-warning' : 'bg-secondary') 
                          : 'bg-outline-variant'
                      }`} 
                    />
                  ))}
                </div>
                <span className={`text-label-md min-w-[45px] text-right ${strengthData.color}`}>
                  {strengthData.label}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/30 rounded-xl text-error text-body-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-start gap-3 mt-1">
            <button 
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors focus:outline-none ${
                agreed 
                  ? 'bg-primary-container border-primary-container text-white' 
                  : 'bg-transparent border-outline-variant text-transparent'
              }`}
            >
              <Check size={12} strokeWidth={4} />
            </button>
            <p className="text-label-md text-on-surface-variant leading-[20px]">
              I agree to the <a href="#" className="text-secondary hover:underline">Terms of Service</a> and Privacy Policy
            </p>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full mt-2">
            Create Account →
          </Button>
        </form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-outline-variant/50"></div>
          <span className="flex-shrink-0 mx-4 text-label-sm uppercase tracking-widest text-outline">or</span>
          <div className="flex-grow border-t border-outline-variant/50"></div>
        </div>

        <button 
          className="w-full h-11 bg-surface-container-high border border-outline-variant rounded-[10px] flex items-center justify-center gap-3 text-label-lg text-on-surface hover:bg-surface-bright active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          Continue with Google
        </button>
      </div>

      <div className="mt-8 text-center pb-8">
        <p className="text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}