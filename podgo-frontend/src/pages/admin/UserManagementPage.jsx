import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Shield, ShieldAlert, UserX, UserCheck } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendToggle = async (id) => {
        try {
            const res = await api.put(`/admin/users/${id}/suspend`);
            toast.success("User status updated");
            setUsers(users.map(u => u.id === id ? res.data.data : u));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update user");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-6">User Management</h2>
            
            {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] shadow-[var(--shadow-card)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-sm uppercase font-semibold border-b border-[var(--border)]">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                                        {user.name}
                                        <div className="text-xs text-[var(--text-muted)] font-normal">{user.email} • {user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-100)] border-[var(--color-primary-200)]' : 'text-[var(--text-primary)] bg-[var(--bg-surface)] border-[var(--border)]'}`}>
                                            {user.role === 'ADMIN' ? <Shield size={12}/> : null}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="text-[var(--color-success-500)] text-sm font-bold flex items-center gap-1"><UserCheck size={16}/> Active</span>
                                        ) : (
                                            <span className="text-[var(--color-danger-500)] text-sm font-bold flex items-center gap-1"><ShieldAlert size={16}/> Suspended</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'ADMIN' && (
                                            <button 
                                                onClick={() => handleSuspendToggle(user.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${user.isActive ? 'bg-[var(--color-danger-100)] text-[var(--color-danger-600)] hover:bg-[var(--color-danger-500)] hover:text-white' : 'bg-[var(--color-success-100)] text-[var(--color-success-600)] hover:bg-[var(--color-success-500)] hover:text-white'}`}
                                            >
                                                {user.isActive ? 'Suspend' : 'Unban'}
                                            </button>
                                        )}
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
