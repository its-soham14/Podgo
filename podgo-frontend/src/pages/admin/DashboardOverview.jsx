import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Car, CheckSquare, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
    const [stats, setStats] = useState({ totalUsers: 0, pendingDrivers: 0, totalRides: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to load admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, colorClass, link }) => (
        <Link to={link} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all flex items-center justify-between group cursor-pointer">
            <div>
                <p className="text-[var(--text-muted)] text-sm font-medium uppercase mb-1">{title}</p>
                <h3 className="text-3xl font-display font-bold text-[var(--text-primary)]">{loading ? '-' : value}</h3>
            </div>
            <div className={`p-4 rounded-full transition-transform group-hover:scale-110 ${colorClass}`}>
                <Icon size={24} />
            </div>
        </Link>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-6">Platform Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    link="/admin/users"
                    colorClass="bg-[var(--color-primary-100)] text-[var(--color-primary-600)]" 
                />
                <StatCard 
                    title="Pending Verifications" 
                    value={stats.pendingDrivers} 
                    icon={CheckSquare} 
                    link="/admin/verifications"
                    colorClass="bg-[var(--color-warning-100)] text-[var(--color-warning-600)]" 
                />
                <StatCard 
                    title="Total Rides" 
                    value={stats.totalRides} 
                    icon={Car} 
                    link="/admin/rides"
                    colorClass="bg-[var(--color-success-100)] text-[var(--color-success-600)]" 
                />
            </div>
            
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] p-8 shadow-[var(--shadow-card)] text-center">
                <div className="inline-flex items-center justify-center p-4 bg-[var(--bg-surface)] rounded-full mb-4 text-[var(--color-accent-500)]">
                    <Activity size={32} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">System Status: Healthy</h3>
                <p className="text-[var(--text-secondary)]">All backend services are operating normally.</p>
            </div>
        </div>
    );
}
