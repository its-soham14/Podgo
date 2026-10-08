import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { X, FileText, ImageIcon } from 'lucide-react';

export default function DriverVerificationPage() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    useEffect(() => {
        fetchPendingProfiles();
    }, []);

    const fetchPendingProfiles = async () => {
        try {
            const res = await api.get('/admin/drivers/pending');
            setProfiles(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch pending profiles");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/admin/drivers/${id}/verify?action=${action}`);
            toast.success(`Profile ${action.toLowerCase()}ed successfully`);
            setProfiles(profiles.filter(p => p.id !== id));
            setSelectedProfile(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-6">Pending Driver Verifications</h2>
            
            {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div></div>
            ) : profiles.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] shadow-[var(--shadow-card)] p-12 text-center">
                    <p className="text-[var(--text-secondary)] text-lg">No pending verifications. You're all caught up!</p>
                </div>
            ) : (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] shadow-[var(--shadow-card)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-sm uppercase font-semibold border-b border-[var(--border)]">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Vehicle Info</th>
                                <th className="px-6 py-4">AI Score</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {profiles.map(profile => (
                                <tr key={profile.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[var(--text-primary)]">{profile.userName}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{profile.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                                        {profile.vehicleModel} <br />
                                        <span className="text-xs font-mono bg-[var(--bg-page)] px-2 py-0.5 rounded">{profile.vehicleNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-[var(--bg-page)] rounded-full h-2 max-w-[100px]">
                                                <div className={`h-2 rounded-full ${profile.verificationScore >= 80 ? 'bg-[var(--color-success-500)]' : profile.verificationScore >= 50 ? 'bg-[var(--color-warning-500)]' : 'bg-[var(--color-danger-500)]'}`} style={{ width: `${profile.verificationScore || 0}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold">{profile.verificationScore || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedProfile(profile)}
                                            className="px-4 py-2 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] hover:text-white rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <h3 className="text-xl font-display font-bold">Review: {selectedProfile.userName}</h3>
                            <button onClick={() => setSelectedProfile(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-[var(--bg-page)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* DL Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-semibold text-[var(--text-secondary)]"><FileText size={18} /> Driving Licence</div>
                                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center h-64">
                                        {selectedProfile.drivingLicenceUrl ? (
                                            <img src={selectedProfile.drivingLicenceUrl} alt="DL" className="max-h-full max-w-full object-contain" />
                                        ) : <span className="text-[var(--text-muted)]">No Image</span>}
                                    </div>
                                </div>
                                {/* Selfie Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-semibold text-[var(--text-secondary)]"><ImageIcon size={18} /> Selfie</div>
                                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center h-64">
                                        {selectedProfile.selfieUrl ? (
                                            <img src={selectedProfile.selfieUrl} alt="Selfie" className="max-h-full max-w-full object-contain" />
                                        ) : <span className="text-[var(--text-muted)]">No Image</span>}
                                    </div>
                                </div>
                                {/* RC Front Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-semibold text-[var(--text-secondary)]"><FileText size={18} /> RC Front</div>
                                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center h-64">
                                        {selectedProfile.rcFrontUrl ? (
                                            <img src={selectedProfile.rcFrontUrl} alt="RC Front" className="max-h-full max-w-full object-contain" />
                                        ) : <span className="text-[var(--text-muted)]">No Image</span>}
                                    </div>
                                </div>
                                {/* Vehicle Details */}
                                <div className="space-y-4 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl">
                                    <h4 className="font-bold text-lg mb-4 border-b border-[var(--border)] pb-2">Extracted Info</h4>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Vehicle Model</p>
                                        <p className="font-medium text-[var(--text-primary)]">{selectedProfile.vehicleModel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Vehicle Number</p>
                                        <p className="font-mono bg-[var(--bg-page)] inline-block px-2 py-1 rounded mt-1 font-bold">{selectedProfile.vehicleNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">AI Confidence Score</p>
                                        <p className={`font-bold text-lg ${profile.verificationScore >= 80 ? 'text-[var(--color-success-500)]' : profile.verificationScore >= 50 ? 'text-[var(--color-warning-500)]' : 'text-[var(--color-danger-500)]'}`}>
                                            {selectedProfile.verificationScore || 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-4 bg-[var(--bg-card)]">
                            <button 
                                onClick={() => handleAction(selectedProfile.id, 'REJECT')}
                                className="px-6 py-3 border border-[var(--color-danger-500)] text-[var(--color-danger-500)] hover:bg-[var(--color-danger-500)] hover:text-white font-bold rounded-xl transition-colors"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => handleAction(selectedProfile.id, 'APPROVE')}
                                className="px-6 py-3 bg-[var(--color-success-500)] text-white hover:bg-[var(--color-success-600)] font-bold rounded-xl shadow-lg transition-colors"
                            >
                                Approve Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
