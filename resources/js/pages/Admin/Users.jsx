import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Users, Search, Filter, MoreVertical } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await adminService.getUsers();
                // API returns { data: { data: [...], total: ... } }
                const usersData = response.data?.data?.data || response.data?.data || [];
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId) => {
        try {
            await adminService.toggleUserStatus(userId);
            setUsers(users.map(user => 
                user.id === userId ? { ...user, is_active: !user.is_active } : user
            ));
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Users size={20} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>User Management</h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{users.length} total users</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '14px',
                                color: '#0f172a',
                                background: '#fff',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: 500, color: '#0f172a' }}>{user.name}</td>
                                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.875rem' }}>{user.email}</td>
                                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.875rem' }}>{user.phone || '-'}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: user.role === 'admin' ? '#ede9fe' : '#f1f5f9',
                                            color: user.role === 'admin' ? '#7c3aed' : '#475569'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: user.is_active ? '#dcfce7' : '#fee2e2',
                                            color: user.is_active ? '#059669' : '#dc2626'
                                        }}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.875rem' }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    background: user.is_active ? '#f59e0b' : '#10b981',
                                                    color: '#fff'
                                                }}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    background: '#ef4444',
                                                    color: '#fff'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
