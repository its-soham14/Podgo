import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

export default function AllRidesPage() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const res = await api.get('/admin/rides');
            setRides(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch rides");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED': return 'text-[var(--color-primary-500)] bg-[var(--color-primary-900)]/20 border-[var(--color-primary-500)]/30';
            case 'ONGOING': return 'text-[var(--color-warning-500)] bg-[var(--color-warning-900)]/20 border-[var(--color-warning-500)]/30';
            case 'COMPLETED': return 'text-[var(--color-success-500)] bg-[var(--color-success-900)]/20 border-[var(--color-success-500)]/30';
            case 'CANCELLED': return 'text-[var(--color-danger-500)] bg-[var(--color-danger-900)]/20 border-[var(--color-danger-500)]/30';
            default: return 'text-[var(--text-secondary)] bg-[var(--bg-surface)] border-[var(--border)]';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-6">All Rides</h2>
            
            {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] shadow-[var(--shadow-card)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-sm uppercase font-semibold border-b border-[var(--border)]">
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Seats/Fare</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {rides.map(ride => (
                                <tr key={ride.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[var(--text-primary)] max-w-xs truncate">{ride.origin.split(',')[0]}</div>
                                        <div className="text-xs text-[var(--text-muted)] max-w-xs truncate">→ {ride.destination.split(',')[0]}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {ride.driverName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {new Date(ride.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {ride.availableSeats}/{ride.totalSeats} seats<br/>
                                        <span className="font-bold text-[var(--color-success-500)]">₹{ride.farePerSeat}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ride.status)}`}>
                                            {ride.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
