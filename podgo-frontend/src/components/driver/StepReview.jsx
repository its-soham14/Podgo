import { CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { useState } from 'react';

export default function StepReview({ formData, files, onSubmit, onBack, loading }) {
  const [agreed, setAgreed] = useState(false);

  const getFilePreview = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="bg-[var(--color-success-900)]/20 border border-[var(--color-success-500)]/30 p-4 rounded-[12px] flex items-start gap-3">
        <ShieldCheck className="text-[var(--color-success-500)] shrink-0" size={24} />
        <div>
          <h4 className="text-[var(--text-primary)] font-semibold text-sm">Almost there!</h4>
          <p className="text-[var(--text-secondary)] text-xs mt-1">Review your details before submitting. Our AI will automatically verify your documents.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-5">
        <h3 className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3 border-b border-[var(--border)] pb-2">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div><span className="text-[var(--text-muted)]">Type:</span> <span className="font-medium text-[var(--text-primary)]">{formData.vehicleType}</span></div>
          <div><span className="text-[var(--text-muted)]">Reg No:</span> <span className="font-medium text-[var(--text-primary)] uppercase">{formData.vehicleNumber}</span></div>
          <div><span className="text-[var(--text-muted)]">Make:</span> <span className="font-medium text-[var(--text-primary)]">{formData.vehicleMake}</span></div>
          <div><span className="text-[var(--text-muted)]">Model:</span> <span className="font-medium text-[var(--text-primary)]">{formData.vehicleModel}</span></div>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-5">
        <h3 className="text-xs uppercase font-bold text-[var(--text-muted)] mb-3 border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <FileCheck size={14} /> Documents Attached
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'RC Front', file: files.rcFront },
            { label: 'RC Back', file: files.rcBack },
            { label: 'ID Proof', file: files.idProof },
            { label: 'Licence', file: files.drivingLicence },
            { label: 'Vehicle', file: files.vehiclePhoto },
            { label: 'Profile', file: files.profilePhoto },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-strong)] px-3 py-1.5 rounded-full text-xs">
              <CheckCircle2 size={12} className="text-[var(--color-success-500)]" />
              <span className="text-[var(--text-secondary)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-5">
        {files.selfie && (
          <img src={getFilePreview(files.selfie)} alt="Selfie" className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-primary-500)]" />
        )}
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Live Selfie Verified</h4>
          <p className="text-xs text-[var(--text-muted)]">Ready for facial matching</p>
        </div>
      </div>

      <label className="flex items-start gap-3 p-2 cursor-pointer group">
        <input 
          type="checkbox" 
          className="mt-1 w-4 h-4 rounded border-[var(--border-strong)] bg-transparent text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
          I confirm that all submitted documents and information are genuine. I understand that submitting false documents may lead to account termination.
        </span>
      </label>

      <div className="flex gap-4 pt-2">
        <button type="button" onClick={onBack} disabled={loading} className="flex-1 bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-[10px] font-medium text-sm hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50">
          Back
        </button>
        <button 
          onClick={onSubmit}
          disabled={!agreed || loading}
          className="flex-[2] bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 rounded-[10px] font-medium text-sm transition-all shadow-[var(--shadow-primary)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : 'Submit for Verification'}
        </button>
      </div>

    </div>
  );
}
