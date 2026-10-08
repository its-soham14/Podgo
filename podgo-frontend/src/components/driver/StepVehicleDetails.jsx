import { Car, Bike } from 'lucide-react';

export default function StepVehicleDetails({ formData, setFormData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-2">Vehicle Type</label>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setFormData({...formData, vehicleType: 'CAR'})}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[12px] border-2 transition-all ${formData.vehicleType === 'CAR' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}
          >
            <Car size={32} />
            <span className="font-semibold text-sm">Car</span>
          </button>
          <button 
            type="button"
            onClick={() => setFormData({...formData, vehicleType: 'BIKE'})}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[12px] border-2 transition-all ${formData.vehicleType === 'BIKE' ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}
          >
            <Bike size={32} />
            <span className="font-semibold text-sm">Bike</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Registration Number (As per RC)</label>
        <input 
          type="text" required placeholder="MH 12 AB 1234"
          value={formData.vehicleNumber}
          onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)] uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Make/Brand</label>
          <input 
            type="text" required placeholder="e.g. Honda"
            value={formData.vehicleMake}
            onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Model</label>
          <input 
            type="text" required placeholder="e.g. City"
            value={formData.vehicleModel}
            onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Color</label>
          <input 
            type="text" required placeholder="e.g. White"
            value={formData.vehicleColor}
            onChange={(e) => setFormData({...formData, vehicleColor: e.target.value})}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase text-[var(--text-muted)] font-medium mb-1">Year</label>
          <input 
            type="number" required placeholder="2022" min="2000" max={new Date().getFullYear()}
            value={formData.yearOfManufacture}
            onChange={(e) => setFormData({...formData, yearOfManufacture: e.target.value})}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onBack} className="flex-1 bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] py-3 rounded-[10px] font-medium text-sm hover:bg-[var(--bg-surface)] transition-colors">
          Back
        </button>
        <button type="submit" className="flex-1 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white py-3 rounded-[10px] font-medium text-sm transition-all shadow-[var(--shadow-primary)]">
          Next Step
        </button>
      </div>
    </form>
  );
}
