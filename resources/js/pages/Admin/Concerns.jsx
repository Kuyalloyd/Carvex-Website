import React, { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/adminService';
import { MessageSquare, Search, Clock } from 'lucide-react';

const CONCERN_STATUSES = ['pending', 'reviewed', 'resolved'];

export default function AdminConcerns() {
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [nextStatusByConcernId, setNextStatusByConcernId] = useState({});
    const [updatingConcernId, setUpdatingConcernId] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchConcerns = async () => {
            try {
                const res = await adminService.getCustomerConcerns({ per_page: 200 });
                const rows = res.data?.data?.data || [];
                if (!mounted) {
                    return;
                }
                setConcerns(rows);
                setNextStatusByConcernId(
                    rows.reduce((acc, concern) => {
                        acc[concern.id] = concern.status || 'pending';
                        return acc;
                    }, {})
                );
            } catch (err) {
                console.error('Failed to fetch concerns:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchConcerns();
        return () => {
            mounted = false;
        };
    }, []);

    const handleUpdateStatus = async (concern) => {
        const nextStatus = nextStatusByConcernId[concern.id] || concern.status;
        if (!nextStatus || nextStatus === concern.status || updatingConcernId === concern.id) {
            return;
        }

        try {
            setUpdatingConcernId(concern.id);
            await adminService.updateCustomerConcern(concern.id, { status: nextStatus });
            setConcerns((prev) => prev.map((item) => (
                item.id === concern.id
                    ? { ...item, status: nextStatus }
                    : item
            )));
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to update concern status';
            window.alert(message);
        } finally {
            setUpdatingConcernId(null);
        }
    };

    const filteredConcerns = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();

        return concerns.filter((concern) => {
            if (statusFilter !== 'all' && concern.status !== statusFilter) {
                return false;
            }

            if (!needle) {
                return true;
            }

            return [
                concern.name,
                concern.email,
                concern.subject,
                concern.message,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(needle));
        });
    }, [concerns, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        pending: concerns.filter((item) => item.status === 'pending').length,
        reviewed: concerns.filter((item) => item.status === 'reviewed').length,
        resolved: concerns.filter((item) => item.status === 'resolved').length,
    }), [concerns]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'reviewed':
                return 'badge-info';
            case 'resolved':
                return 'badge-success';
            default:
                return 'badge-secondary';
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-modern">
                    <div className="loading">Loading support tickets...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-dashboard-modern">
                <div className="admin-page-header">
                    <div className="header-content">
                        <h1>Customer Service</h1>
                        <p>Review all customer concerns and update their status</p>
                    </div>
                </div>

                <div className="admin-stat-grid">
                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--amber">
                            <Clock size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Pending</div>
                            <div className="stat-value">{stats.pending}</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--blue">
                            <MessageSquare size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Reviewed</div>
                            <div className="stat-value">{stats.reviewed}</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--green">
                            <span>✓</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Resolved</div>
                            <div className="stat-value">{stats.resolved}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <div className="admin-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search by customer, email, subject, or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="admin-filters">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                {CONCERN_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {filteredConcerns.length === 0 ? (
                        <div className="admin-empty-state">
                            <MessageSquare size={48} />
                            <h3>No Tickets Found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ticket</th>
                                        <th>Customer</th>
                                        <th>Subject</th>
                                        <th>Message</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConcerns.map((concern) => {
                                        const currentStatus = CONCERN_STATUSES.includes(concern.status) ? concern.status : 'pending';
                                        const selectedStatusRaw = nextStatusByConcernId[concern.id] || currentStatus;
                                        const selectedStatus = CONCERN_STATUSES.includes(selectedStatusRaw) ? selectedStatusRaw : currentStatus;
                                        const isUpdating = updatingConcernId === concern.id;
                                        const canApply = selectedStatus !== currentStatus && !isUpdating;

                                        return (
                                            <tr key={concern.id}>
                                                <td>
                                                    <strong>TKT-{String(concern.id).padStart(4, '0')}</strong>
                                                </td>
                                                <td>
                                                    <strong>{concern.name || 'Customer'}</strong>
                                                    <div className="text-muted">{concern.email || 'No email'}</div>
                                                </td>
                                                <td className="text-muted">{concern.subject || 'General concern'}</td>
                                                <td className="text-muted">
                                                    {String(concern.message || '').slice(0, 90)}
                                                    {String(concern.message || '').length > 90 ? '...' : ''}
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(currentStatus)}`}>
                                                        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="text-muted">
                                                    {concern.created_at ? new Date(concern.created_at).toLocaleString() : 'N/A'}
                                                </td>
                                                <td>
                                                    <div className="admin-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <select
                                                            value={selectedStatus}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setNextStatusByConcernId((prev) => ({ ...prev, [concern.id]: value }));
                                                            }}
                                                            disabled={isUpdating}
                                                        >
                                                            {CONCERN_STATUSES.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleUpdateStatus(concern)}
                                                            disabled={!canApply}
                                                        >
                                                            {isUpdating ? 'Saving...' : 'Apply'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
