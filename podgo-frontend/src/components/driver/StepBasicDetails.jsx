import { useAuthStore } from '../../store/authStore';

export default function StepBasicDetails({ formData, setFormData, onNext }) {
  const user = useAuthStore(state => state.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Full Name</label>
        <input 
          type="text" 
          disabled
          value={user?.name || ''}
          className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm text-[var(--text-muted)] cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Phone Number</label>
        <input 
          type="tel" required
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="+91 98765 43210"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Date of Birth</label>
        <input 
          type="date" required
          value={formData.dob}
          onChange={(e) => setFormData({...formData, dob: e.target.value})}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Emergency Contact</label>
        <input 
          type="tel" required
          value={formData.emergencyContact}
          onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
          placeholder="Family member's number"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
        />
      </div>

      <div className="pt-4">
        <button type="submit" className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 rounded-[10px] font-medium text-sm transition-all shadow-[var(--shadow-primary)]">
          Next Step
        </button>
      </div>
    </form>
  );
}
