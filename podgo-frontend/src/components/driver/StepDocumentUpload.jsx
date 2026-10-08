import { UploadCloud, X, FileText } from 'lucide-react';
import { useRef } from 'react';

export default function StepDocumentUpload({ files, setFiles, onNext, onBack }) {
  
  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setFiles({ ...files, [key]: file });
    } else if (file) {
      alert("File size must be under 5MB");
    }
  };

  const removeFile = (key) => {
    setFiles({ ...files, [key]: null });
  };

  const isFormValid = () => {
    return files.rcFront && files.rcBack && files.idProof && files.drivingLicence && files.vehiclePhoto && files.profilePhoto;
  };

  const FileUploadBox = ({ title, fileKey }) => {
    const inputRef = useRef(null);
    const file = files[fileKey];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase text-[var(--text-muted)] font-medium">{title}</label>
        {!file ? (
          <div 
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/5 bg-[var(--bg-surface)] rounded-[12px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[120px]"
          >
            <UploadCloud size={24} className="text-[var(--color-primary-400)] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Click to upload</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">JPG, PNG, PDF (Max 5MB)</p>
            <input 
              type="file" ref={inputRef} className="hidden" 
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, fileKey)}
            />
          </div>
        ) : (
          <div className="relative border border-[var(--color-primary-500)] bg-[var(--color-primary-900)] rounded-[12px] p-2 flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
            {file.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(file)} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <FileText size={32} className="text-[var(--color-primary-300)]" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => removeFile(fileKey)}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
              >
                <X size={16} />
              </button>
            </div>
            <div className="relative z-10 bg-black/60 px-2 py-1 rounded text-xs text-white truncate max-w-full mt-auto">
              {file.name}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <FileUploadBox title="RC Front Photo" fileKey="rcFront" />
        <FileUploadBox title="RC Back Photo" fileKey="rcBack" />
        <FileUploadBox title="Govt ID (Aadhaar/PAN)" fileKey="idProof" />
        <FileUploadBox title="Driving Licence" fileKey="drivingLicence" />
        <FileUploadBox title="Vehicle Photo" fileKey="vehiclePhoto" />
        <FileUploadBox title="Profile Photo (Formal)" fileKey="profilePhoto" />
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onBack} className="flex-1 bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-[10px] font-medium text-sm hover:bg-[var(--bg-surface)] transition-colors">
          Back
        </button>
        <button 
          type="button" 
          onClick={onNext}
          disabled={!isFormValid()}
          className="flex-1 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 rounded-[10px] font-medium text-sm transition-all shadow-[var(--shadow-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
