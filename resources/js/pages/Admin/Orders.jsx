import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { ShoppingCart, Download, Eye, Search, Trash2, Package, Clock, Truck, CheckCircle, XCircle, X } from 'lucide-react';

const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (value) => `PHP ${Number(value || 0).toFixed(2)}`;

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [nextStatusByOrderId, setNextStatusByOrderId] = useState({});
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchOrders = async () => {
            try {
                const res = await adminService.getAllOrders({
                    params: {
                        include_items: true,
                        include_users: true,
                        per_page: 200,
                    },
                });
                if (mounted) {
                    const rows = res.data?.data?.data || [];
                    setOrders(rows);
                    setNextStatusByOrderId(
                        rows.reduce((acc, order) => {
                            acc[order.id] = order.status || 'processing';
                            return acc;
                        }, {})
                    );
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
        return () => {
            mounted = false;
        };
    }, []);

    const handleUpdateStatus = async (order) => {
        const nextStatus = nextStatusByOrderId[order.id] || order.status;
        if (!order || !nextStatus || nextStatus === order.status || updatingOrderId === order.id) {
            return;
        }

        try {
            setUpdatingOrderId(order.id);
            // Backend will auto-generate tracking number if shipping and none exists
            await adminService.updateOrderStatus(order.id, nextStatus);
            setOrders((prev) => prev.map((item) => (
                item.id === order.id
                    ? { ...item, status: nextStatus }
                    : item
            )));
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to update order status';
            window.alert(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Are you sure you want to delete order ${order.order_number || order.id}? This action cannot be undone.`)) {
            return;
        }
        try {
            await adminService.deleteOrder(order.id);
            setOrders((prev) => prev.filter((item) => item.id !== order.id));
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to delete order';
            window.alert(message);
        }
    };

    const filteredOrders = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();

        return orders.filter((order) => {
            if (statusFilter !== 'all' && order.status !== statusFilter) {
                return false;
            }

            if (!needle) {
                return true;
            }

            return [
                order.order_number,
                String(order.id || ''),
                order.tracking_number,
                order.user?.name,
                order.user?.email,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(needle));
        });
    }, [orders, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        processing: orders.filter((o) => o.status === 'processing').length,
        shipped: orders.filter((o) => o.status === 'shipped').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }), [orders]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'processing':
                return 'badge-warning';
            case 'shipped':
                return 'badge-info';
            case 'delivered':
                return 'badge-success';
            case 'cancelled':
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-modern">
                    <div className="loading">Loading orders...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="admin-page">
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Order Management</h1>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{stats.total} total orders</p>
                            </div>
                        </div>
                    </div>

                    {/* Orders Panel */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        {/* Search & Filter Bar */}
                        <div style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                flex: 1,
                                minWidth: '200px',
                                maxWidth: '300px',
                                position: 'relative'
                            }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem 0.5rem 2rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '0.8125rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        color: '#1e293b'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    padding: '0.625rem 2rem 0.625rem 1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: '#0f172a',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    width: '140px'
                                }}
                            >
                                <option value="all">All Statuses</option>
                                {ORDER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div style={{
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                color: '#64748b'
                            }}>
                                <ShoppingCart size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#475569' }}>No Orders Found</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking #</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => {
                                            const currentStatus = ORDER_STATUSES.includes(order.status) ? order.status : 'processing';
                                            const selectedStatusRaw = nextStatusByOrderId[order.id] || currentStatus;
                                            const selectedStatus = ORDER_STATUSES.includes(selectedStatusRaw) ? selectedStatusRaw : currentStatus;
                                            const isUpdating = updatingOrderId === order.id;
                                            const canApply = selectedStatus !== currentStatus && !isUpdating;
                                            const itemNames = Array.isArray(order.items)
                                                ? order.items.map((item) => item.product?.name).filter(Boolean)
                                                : [];

                                            const statusColors = {
                                                processing: { bg: '#fef3c7', text: '#92400e' },
                                                shipped: { bg: '#e0f2fe', text: '#075985' },
                                                delivered: { bg: '#d1fae5', text: '#065f46' },
                                                cancelled: { bg: '#fee2e2', text: '#991b1b' }
                                            };
                                            const statusColor = statusColors[currentStatus] || statusColors.processing;

                                            return (
                                                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{order.order_number || `ORD-${String(order.id).padStart(3, '0')}`}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>#{order.id}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.875rem' }}>{order.user?.name || 'N/A'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{order.user?.email || 'No email'}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                        {itemNames.length > 0 ? itemNames.slice(0, 2).join(', ') : 'N/A'}
                                                        {itemNames.length > 2 ? <span style={{ color: '#94a3b8' }}> +{itemNames.length - 2} more</span> : ''}
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{formatCurrency(order.total_amount || order.total)}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: statusColor.bg,
                                                            color: statusColor.text,
                                                            display: 'inline-block'
                                                        }}>
                                                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: order.tracking_number ? '#0ea5e9' : '#94a3b8' }}>
                                                            {order.tracking_number || '-'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', minWidth: '280px' }}>
                                                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <select
                                                                value={selectedStatus}
                                                                onChange={(event) => {
                                                                    const value = event.target.value;
                                                                    setNextStatusByOrderId((prev) => ({ ...prev, [order.id]: value }));
                                                                }}
                                                                disabled={isUpdating}
                                                                style={{
                                                                    padding: '0.375rem 1.25rem 0.375rem 0.5rem',
                                                                    fontSize: '0.7rem',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '5px',
                                                                    background: '#fff',
                                                                    cursor: 'pointer',
                                                                    outline: 'none',
                                                                    color: '#1e293b',
                                                                    minWidth: '70px'
                                                                }}
                                                            >
                                                                {ORDER_STATUSES.map((value) => (
                                                                    <option key={value} value={value}>
                                                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(order)}
                                                                disabled={!canApply}
                                                                style={{
                                                                    padding: '0.375rem 0.5rem',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 500,
                                                                    border: 'none',
                                                                    borderRadius: '5px',
                                                                    cursor: canApply ? 'pointer' : 'not-allowed',
                                                                    background: canApply ? '#10b981' : '#d1d5db',
                                                                    color: '#fff',
                                                                    transition: 'background 0.2s',
                                                                    whiteSpace: 'nowrap',
                                                                    minWidth: '40px'
                                                                }}
                                                                onMouseEnter={(e) => canApply && (e.currentTarget.style.background = '#059669')}
                                                                onMouseLeave={(e) => canApply && (e.currentTarget.style.background = '#10b981')}
                                                            >
                                                                {isUpdating ? '...' : '✓'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedOrder(order)}
                                                                style={{
                                                                    padding: '0.375rem',
                                                                    border: 'none',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    background: '#3b82f6',
                                                                    color: '#fff',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'background 0.2s',
                                                                    width: '28px',
                                                                    height: '28px'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                                                title="View Order"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(order)}
                                                                style={{
                                                                    padding: '0.375rem',
                                                                    border: 'none',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    background: '#ef4444',
                                                                    color: '#fff',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'background 0.2s',
                                                                    width: '28px',
                                                                    height: '28px'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                                                title="Delete Order"
                                                            >
                                                                <Trash2 size={14} />
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2147483647,
                    padding: '1rem'
                }} onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedOrder(null);
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'fadeIn 0.2s ease'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fff',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Order {selectedOrder.order_number || `#${selectedOrder.id}`}</h2>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    color: '#64748b',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e2e8f0';
                                    e.currentTarget.style.color = '#475569';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.color = '#64748b';
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', color: '#1e293b' }}>
                            {/* Customer Details */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Customer Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Name</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.user?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Email</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Phone</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.user?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Shipping Address</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.shipping_address || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Order Items</h3>
                                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Qty</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Price</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem', fontWeight: 500, color: '#1e293b' }}>{item.product?.name || 'Unknown'}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>{item.quantity}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#1e293b' }}>{formatCurrency(item.unit_price)}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#64748b', margin: 0 }}>No items found</p>
                                )}
                            </div>

                            {/* Payment & Totals */}
                            <div>
                                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Payment & Totals</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Payment Method</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.payment_method || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Payment Status</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{selectedOrder.payment_status || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Total Amount</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(selectedOrder.total_amount || selectedOrder.total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
