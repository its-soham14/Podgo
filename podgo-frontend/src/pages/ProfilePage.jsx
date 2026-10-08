import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, Phone, Mail, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser, setCredentials, token } = useAuthStore();
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', profilePhotoUrl: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        const data = res.data.data;
        setProfile({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          profilePhotoUrl: data.profilePhotoUrl || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/users/me', {
        name: profile.name,
        phone: profile.phone
      });
      const updatedUser = res.data.data;
      setCredentials({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role }, token);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen bg-[var(--bg-page)] pt-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-card)] rounded-[14px] p-6 md:p-8">
          <h1 className="text-2xl font-display font-bold mb-6 text-center">Your Profile</h1>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--color-primary-500)] flex items-center justify-center mb-4 overflow-hidden shadow-[var(--shadow-primary)]">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[var(--text-muted)]" />
              )}
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-md mb-6 text-sm ${message.type === 'success' ? 'bg-[var(--color-success-100)] text-[var(--color-success-500)]' : 'bg-[var(--color-danger-100)] text-[var(--color-danger-500)]'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <User size={16} />
                </div>
                <input 
                  type="text" required
                  className="w-full pl-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 pr-4 text-sm focus:outline-none"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Email (Read Only)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" disabled
                  className="w-full pl-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 pr-4 text-sm text-[var(--text-muted)] cursor-not-allowed"
                  value={profile.email}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Phone size={16} />
                </div>
                <input 
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 pr-4 text-sm focus:outline-none"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 rounded-[10px] font-medium text-sm transition-all shadow-[var(--shadow-primary)] disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
