import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import adminService from '../../services/adminService';
import { ShoppingCart, Users, Headphones, TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';

// Simple Line Chart Component
const LineChart = ({ data, labels }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 320;
    const height = 140;
    const padding = 32;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg">
            {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={padding} y1={padding + (i / 4) * chartHeight} x2={width - padding} y2={padding + (i / 4) * chartHeight} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
                <text key={i} x={padding - 10} y={padding + (i / 4) * chartHeight + 4} textAnchor="end" fill="#64748b" fontSize="12">
                    {Math.round(max - (i / 4) * range)}
                </text>
            ))}
            {labels.map((label, i) => (
                <text key={i} x={padding + (i / (labels.length - 1)) * chartWidth} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="12">
                    {label}
                </text>
            ))}
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((value, i) => {
                const x = padding + (i / (data.length - 1)) * chartWidth;
                const y = height - padding - ((value - min) / range) * chartHeight;
                return <circle key={i} cx={x} cy={y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />;
            })}
        </svg>
    );
};

// Simple Bar Chart Component
const BarChart = ({ data, labels }) => {
    const max = Math.max(...data);
    const width = 320;
    const height = 140;
    const padding = 32;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = (chartWidth / data.length) * 0.6;
    const gap = (chartWidth / data.length) * 0.4;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg">
            {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={padding} y1={padding + (i / 4) * chartHeight} x2={width - padding} y2={padding + (i / 4) * chartHeight} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
            ))}
            {[0, 25, 50, 75, 100].map((val, i) => (
                <text key={i} x={padding - 10} y={height - padding - (val / 100) * chartHeight + 4} textAnchor="end" fill="#64748b" fontSize="12">
                    {val}
                </text>
            ))}
            {data.map((value, i) => {
                const barHeight = (value / max) * chartHeight;
                const x = padding + i * (barWidth + gap) + gap / 2;
                const y = height - padding - barHeight;
                return (
                    <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill="#8b5cf6" rx="4" />
                );
            })}
            {labels.map((label, i) => (
                <text key={i} x={padding + i * (barWidth + gap) + gap / 2 + barWidth / 2} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="12">
                    {label}
                </text>
            ))}
        </svg>
    );
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load critical stats first
            const [statsRes, ordersCountRes, productsCountRes, usersCountRes] = await Promise.all([
                adminService.getStats(),
                adminService.getAllOrders({ params: { count_only: true, per_page: 1 } }),
                adminService.getProducts({ params: { count_only: true } }),
                adminService.getUsers({ params: { count_only: true } }),
            ]);

            const orders = ordersCountRes.data?.data?.total || ordersCountRes.data?.data?.data?.length || 0;
            const products = productsCountRes.data?.data?.total || productsCountRes.data?.data?.data?.length || 0;
            const users = usersCountRes.data?.data?.total || usersCountRes.data?.data?.data?.length || 0;

            setStats({
                ...statsRes.data.data,
                total_orders: orders,
                total_products: products,
                total_users: users,
            });

            // Load secondary data in background
            Promise.all([
                adminService.getSalesReport(),
                adminService.getAllOrders({ params: { per_page: 8, include_users: true, include_items: false } }),
                adminService.getUsers({ params: { per_page: 8 } }),
                adminService.getCustomerConcerns({ per_page: 8 }),
            ]).then(([salesRes, ordersListRes, usersListRes, concernsListRes]) => {
                setSalesData(salesRes.data.data);

                const orderRows = ordersListRes.data?.data?.data || [];
                const userRows = usersListRes.data?.data?.data || [];
                const concernRows = concernsListRes.data?.data?.data || [];
                const combinedActivities = [
                    ...orderRows.map((order) => ({
                        id: `order-${order.id}`,
                        type: 'order',
                        title: `Order ${order.order_number || `#${order.id}`}`,
                        description: order.user?.name ? `Placed by ${order.user.name}` : 'Placed by customer',
                        createdAt: order.created_at,
                    })),
                    ...userRows.map((userRow) => ({
                        id: `user-${userRow.id}`,
                        type: 'user',
                        title: 'New user account',
                        description: `${userRow.name} (${userRow.email})`,
                        createdAt: userRow.created_at,
                    })),
                    ...concernRows.map((concern) => ({
                        id: `concern-${concern.id}`,
                        type: 'concern',
                        title: concern.subject || 'Customer concern',
                        description: concern.name ? `${concern.name} submitted a concern` : 'Customer concern submitted',
                        createdAt: concern.created_at,
                    })),
                ]
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .slice(0, 12);

                setRecentOrders(orderRows);
                setRecentUsers(userRows);
                setActivityFeed(combinedActivities);
            }).catch((err) => {
                console.error('Failed to load secondary dashboard data:', err);
            });

            setLoading(false);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000) {
            return `₱${(value / 1000).toFixed(1)}k`;
        }
        return `₱${value}`;
    };

    const revenueData = [14000, 16000, 21000, 19000, 23000, 28000];
    const revenueLabels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const ordersData = [45, 58, 75, 65, 85, 95];
    const ordersLabels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-modern">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <div className="admin-dashboard-modern">
                <AdminNavbar stats={stats} loading={false} />

                {/* Stats Grid - Professional Design */}
                <div className="admin-stat-grid">
                    {[
                        { label: 'Total Revenue', value: formatCurrency(stats?.total_revenue || 117600), trend: '+12.5%', Icon: DollarSign, color: 'green' },
                        { label: 'Total Orders', value: stats?.total_orders || 0, trend: '+8.2%', Icon: ShoppingCart, color: 'blue' },
                        { label: 'Parts in Stock', value: stats?.total_products || 8, trend: '+3.1%', Icon: Package, color: 'purple' },
                        { label: 'Users', value: stats?.total_users || 0, trend: '+5.3%', Icon: Users, color: 'blue' },
                        { label: 'Low Stock Alert', value: stats?.low_stock_count || 3, trend: 'Needs attention', Icon: AlertTriangle, color: 'amber', isAlert: true },
                    ].map((stat, i) => (
                        <div key={i} className="admin-stat-card">
                            <div className={`stat-icon stat-icon--${stat.color}`}>
                                <stat.Icon size={20} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                                <div className={`stat-trend ${stat.isAlert ? 'negative' : 'positive'}`}>
                                    {stat.isAlert ? <AlertTriangle size={12} /> : <TrendingUp size={12} />}{stat.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid - Professional */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="admin-chart-container">
                        <div className="admin-chart-header">
                            <h3>Revenue Overview</h3>
                        </div>
                        <LineChart data={revenueData} labels={revenueLabels} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#64748b' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>
                            Revenue (₱)
                        </div>
                    </div>
                    <div className="admin-chart-container">
                        <div className="admin-chart-header">
                            <h3>Monthly Orders</h3>
                        </div>
                        <BarChart data={ordersData} labels={ordersLabels} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#64748b' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }}></span>
                            Orders
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', overflow: 'auto' }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#0f172a' }}>Recent Customer Accounts</h2>
                        {recentUsers.length === 0 ? (
                            <p style={{ color: '#64748b', margin: 0 }}>No recent users found.</p>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Orders</th>
                                            <th>Last Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map((userRow) => (
                                            <tr key={userRow.id}>
                                                <td><strong>{userRow.name}</strong></td>
                                                <td className="text-muted">{userRow.email}</td>
                                                <td className="text-muted">{userRow.role || 'customer'}</td>
                                                <td>{Number(userRow.orders_count || 0)}</td>
                                                <td className="text-muted">{userRow.last_order_at ? new Date(userRow.last_order_at).toLocaleString() : 'No orders yet'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', overflow: 'auto' }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: '#0f172a' }}>Recent Orders (All Customers)</h2>
                        {recentOrders.length === 0 ? (
                            <p style={{ color: '#64748b', margin: 0 }}>No recent orders found.</p>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td><strong>{order.order_number || `#${order.id}`}</strong></td>
                                                <td className="text-muted">{order.user?.name || 'N/A'}</td>
                                                <td>{formatCurrency(order.total_amount || 0)}</td>
                                                <td className="text-muted">{order.status}</td>
                                                <td className="text-muted">{order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h3>Recent Activity Feed</h3>
                    </div>
                    {activityFeed.length === 0 ? (
                        <div className="admin-empty-state">
                            <p>No recent activities found.</p>
                        </div>
                    ) : (
                        <div className="admin-activity-feed">
                            {activityFeed.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className={`activity-icon ${activity.type}`}>
                                        {activity.type === 'order' && <ShoppingCart size={20} />}
                                        {activity.type === 'user' && <Users size={20} />}
                                        {activity.type === 'concern' && <Headphones size={20} />}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{activity.title}</div>
                                        <div className="activity-desc">{activity.description}</div>
                                        <div className="activity-time">
                                            {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
