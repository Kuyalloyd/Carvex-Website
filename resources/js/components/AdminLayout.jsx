import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, Home, ShoppingBag, Package, Users, Headphones, Settings, LogOut, ChevronDown } from 'lucide-react';
import adminService from '../services/adminService';
import { preloadAdminRoute, preloadAllAdminRoutes } from '../utils/adminRoutePreload';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_REFRESH_MS = 30000;
const SIDEBAR_CACHE_KEY = 'admin_sidebar_counts_v2';

const readCachedSidebarCounts = () => {
    try {
        const raw = localStorage.getItem(SIDEBAR_CACHE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        return {
            products: Number(parsed.products || 0),
            orders: Number(parsed.orders || 0),
            users: Number(parsed.users || 0),
            newConcerns: Number(parsed.newConcerns || 0),
        };
    } catch {
        return null;
    }
};

const extractCollection = (response) => {
    const payload = response?.data?.data;

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    return [];
};

const extractTotal = (response) => {
    const payload = response?.data?.data;
    const total = Number(payload?.total);
    console.log('extractTotal - response:', response);
    console.log('extractTotal - payload:', payload);
    console.log('extractTotal - total:', total);
    if (Number.isFinite(total) && total >= 0) {
        return total;
    }

    return extractCollection(response).length;
};

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sidebarCounts, setSidebarCounts] = useState(() => (
        readCachedSidebarCounts() || {
            products: 0,
            orders: 0,
            users: 0,
            newConcerns: 0,
        }
    ));
    const sidebarRequestIdRef = useRef(0);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const profileRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const menuRef = useRef(null);

    const titleMap = {
        '/admin/dashboard': 'Dashboard',
        '/admin/orders': 'Orders',
        '/admin/products': 'Products',
        '/admin/users': 'Users',
        '/admin/customer-service': 'Customer Service',
        '/admin/concerns': 'Customer Service',
        '/admin/account': 'Account',
    };

    const title = (() => {
        const pathname = location.pathname;
        if (pathname.startsWith('/admin/orders')) return 'Orders';
        if (pathname.startsWith('/admin/products')) return 'Products';
        if (pathname.startsWith('/admin/users')) return 'Users';
        if (pathname.startsWith('/admin/customer-service') || pathname.startsWith('/admin/concerns')) return 'Customer Service';
        return titleMap[pathname] || 'Dashboard';
    })();

    const navItems = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: Home, badge: null },
        { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: sidebarCounts.orders },
        { to: '/admin/products', label: 'Inventory', icon: Package, badge: sidebarCounts.products },
        { to: '/admin/users', label: 'Users', icon: Users, badge: sidebarCounts.users },
        { to: '/admin/customer-service', label: 'Support', icon: Headphones, badge: sidebarCounts.newConcerns > 0 ? sidebarCounts.newConcerns : null },
        { to: '/admin/account', label: 'Settings', icon: Settings, badge: null },
    ];

    const loadSidebarCounts = async () => {
        sidebarRequestIdRef.current += 1;
        const requestId = sidebarRequestIdRef.current;

        try {
            const statsResult = await adminService.getStats({ timeout: 5000 });

            if (sidebarRequestIdRef.current !== requestId) {
                return;
            }

            const statsData = statsResult?.data?.data;
            const orders = Number(statsData?.total_orders || 0);
            const products = Number(statsData?.total_products || 0);
            // Filter out admin users for the sidebar count
            let users = 0;
            if (Array.isArray(statsData?.users)) {
                users = statsData.users.filter(user => String(user.role || '').toLowerCase() !== 'admin').length;
            } else {
                users = Number(statsData?.total_users || 0);
            }
            const newConcerns = Number(statsData?.pending_customer_concerns || 0);

            console.log('Sidebar counts:', { orders, products, users, newConcerns });

            setSidebarCounts({
                products,
                orders,
                users,
                newConcerns,
            });
        } catch (error) {
            console.error('Sidebar counts error:', error);
        }
    };

    useEffect(() => {
        preloadAllAdminRoutes();

        localStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify(sidebarCounts));
    }, [sidebarCounts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchDropdownOpen(false);
            }
        };

        // Clear cache and load fresh data
        localStorage.removeItem(SIDEBAR_CACHE_KEY);
        setTimeout(() => loadSidebarCounts(), 300);

        const intervalId = window.setInterval(loadSidebarCounts, SIDEBAR_REFRESH_MS);

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                // Refresh when tab becomes visible
                setTimeout(() => loadSidebarCounts(), 300);
            }
        };

        const handleSidebarRefresh = () => {
            loadSidebarCounts();
        };

        // Listen for profile update events
        const handleProfileUpdate = () => {
            // Just refresh sidebar counts - no need to dispatch storage event
            // This prevents page remount when saving profile
            loadSidebarCounts();
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('sidebar-counts-refresh', handleSidebarRefresh);
        window.addEventListener('profile-updated', handleProfileUpdate);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('sidebar-counts-refresh', handleSidebarRefresh);
            window.removeEventListener('profile-updated', handleProfileUpdate);
            clearInterval(intervalId);
        };
    }, []);

    const handleLogout = async () => {
        if (logoutLoading) {
            return;
        }

        if (!window.confirm('Are you sure you want to logout from admin?')) {
            return;
        }

        setLogoutLoading(true);
        try {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('user_token');
            navigate('/login');
        } catch {
            navigate('/login');
        } finally {
            setLogoutLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!query.trim()) {
            setSearchResults([]);
            setSearchDropdownOpen(false);
            return;
        }

        setSearchLoading(true);
        setSearchDropdownOpen(true);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    adminService.getAllOrders({ params: { search: query, per_page: 5, include_users: true } }),
                    adminService.getProducts({ params: { search: query, per_page: 5 } }),
                    adminService.getUsers({ params: { search: query, per_page: 5 } }),
                ]);

                const orders = ordersRes.data?.data?.data || [];
                const products = productsRes.data?.data?.data || [];
                const users = usersRes.data?.data?.data || [];

                const results = [
                    ...orders.map((order) => ({
                        type: 'order',
                        id: order.id,
                        title: `Order ${order.order_number || `#${order.id}`}`,
                        subtitle: order.user?.name || 'Unknown customer',
                        route: `/admin/orders`,
                        amount: order.total_amount || order.total
                    })),
                    ...products.map((product) => ({
                        type: 'product',
                        id: product.id,
                        title: product.name,
                        subtitle: `SKU: ${product.sku || 'N/A'}`,
                        route: `/admin/products`,
                        price: product.price
                    })),
                    ...users.map((user) => ({
                        type: 'user',
                        id: user.id,
                        title: user.name,
                        subtitle: user.email,
                        route: `/admin/users`
                    }))
                ].slice(0, 10);

                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const handleSearchResultClick = (result) => {
        setSearchQuery('');
        setSearchResults([]);
        setSearchDropdownOpen(false);
        navigate(result.route);
    };

    const formatCurrency = (value) => `PHP ${Number(value || 0).toFixed(2)}`;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Breadcrumb generation
    const getBreadcrumbs = () => {
        const parts = location.pathname.split('/').filter(Boolean);
        if (parts.length === 1) return [{ label: 'Home', to: '/admin/dashboard' }];
        return [
            { label: 'Home', to: '/admin/dashboard' },
            { label: title, to: location.pathname }
        ];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Professional Sidebar */}
            <aside style={{
                width: mobileMenuOpen ? '280px' : undefined,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                borderRight: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 50,
                boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease'
            }} className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                {/* Logo Section */}
                <div style={{
                    padding: '2rem 1.5rem 1.5rem',
                    borderBottom: '1px solid #334155'
                }}>
                    <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}>
                            <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>C</span>
                        </div>
                        <div>
                            <span style={{
                                color: '#fff',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                letterSpacing: '-0.02em'
                            }}>CarVex</span>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Portal</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem', overflowY: 'auto' }}>
                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#64748b',
                        padding: '0 0.75rem 0.75rem',
                        marginBottom: '0.5rem'
                    }}>Menu</p>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onMouseEnter={() => preloadAdminRoute(item.to)}
                                onFocus={() => preloadAdminRoute(item.to)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '10px',
                                    marginBottom: '0.375rem',
                                    textDecoration: 'none',
                                    color: isActive ? '#fff' : '#94a3b8',
                                    background: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 600 : 500,
                                    transition: 'all 0.2s ease',
                                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                                    border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent'
                                }}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge && (
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: '#ef4444',
                                        color: '#fff',
                                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {mobileMenuOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 40
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: '#f8fafc',
                transition: 'margin-left 0.3s ease'
            }} className="admin-main-content">
                {/* Top Navigation Bar */}
                <header style={{
                    background: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    height: '64px'
                }}>
                    {/* Left: Breadcrumbs & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                display: 'none',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '0.625rem',
                                cursor: 'pointer',
                                color: '#475569'
                            }}
                            className="mobile-menu-btn"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div>
                            {/* Breadcrumbs */}
                            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={crumb.label}>
                                        {idx > 0 && <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>/</span>}
                                        <Link
                                            to={crumb.to}
                                            style={{
                                                fontSize: '0.8rem',
                                                color: idx === breadcrumbs.length - 1 ? '#3b82f6' : '#64748b',
                                                textDecoration: 'none',
                                                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
                                            }}
                                        >
                                            {crumb.label}
                                        </Link>
                                    </React.Fragment>
                                ))}
                            </nav>
                            <h1 style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>{title}</h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Search - Compact */}
                        <div ref={searchRef} style={{ position: 'relative' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.375rem 0.75rem',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                minWidth: '160px',
                                height: '32px'
                            }} className="admin-search-box">
                                <Search size={14} color="#94a3b8" />
                                <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => searchQuery && setSearchDropdownOpen(true)}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    outline: 'none',
                                    fontSize: '0.875rem',
                                    color: '#1e293b',
                                    width: '100%',
                                    minWidth: '80px'
                                }}
                            />    
                            </div>

                            {/* Search Results Dropdown */}
                            {searchDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid #e2e8f0',
                                    minWidth: '280px',
                                    maxWidth: '400px',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    maxHeight: '400px',
                                    overflowY: 'auto'
                                }}>
                                    {searchLoading ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                            Searching...
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                            No results found
                                        </div>
                                    ) : (
                                        searchResults.map((result) => (
                                            <div
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleSearchResultClick(result)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        background: result.type === 'order' ? '#dbeafe' : result.type === 'product' ? '#f3e8ff' : '#dcfce7',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: result.type === 'order' ? '#2563eb' : result.type === 'product' ? '#7c3aed' : '#16a34a',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {result.type === 'order' ? 'ORD' : result.type === 'product' ? 'PRD' : 'USR'}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {result.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                                                            {result.subtitle}
                                                        </div>
                                                    </div>
                                                    {result.amount && (
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                                                            {formatCurrency(result.amount)}
                                                        </div>
                                                    )}
                                                    {result.price && (
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                                                            {formatCurrency(result.price)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button style={{
                            position: 'relative',
                            padding: '0.5rem',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#475569',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            <Bell size={18} />
                            {sidebarCounts.newConcerns > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    width: '16px',
                                    height: '16px',
                                    background: '#ef4444',
                                    borderRadius: '50%',
                                    fontSize: '0.6rem',
                                    color: '#fff',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #fff'
                                }}>{sidebarCounts.newConcerns}</span>
                            )}
                        </button>

                        {/* Profile Icon - Professional with Dropdown */}
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: user?.profile_picture ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 4px rgba(59, 130, 246, 0.3)',
                                    border: '2px solid #fff',
                                    padding: 0,
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(59, 130, 246, 0.3)';
                                }}
                            >
                                {user?.profile_picture ? (
                                    <img 
                                        src={user.profile_picture} 
                                        alt="Profile" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid #e2e8f0',
                                    minWidth: '180px',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <Link
                                        to="/admin/account"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1rem',
                                            color: '#475569',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => setProfileDropdownOpen(false)}
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logoutLoading}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1rem',
                                            color: '#ef4444',
                                            background: 'none',
                                            border: 'none',
                                            width: '100%',
                                            fontSize: '0.875rem',
                                            cursor: logoutLoading ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.2s',
                                            opacity: logoutLoading ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => !logoutLoading && (e.currentTarget.style.background = '#fef2f2')}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut size={16} />
                                        {logoutLoading ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Logout Loading Overlay */}
                {logoutLoading && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999999,
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '4px solid rgba(59, 130, 246, 0.2)',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{
                            color: '#fff',
                            fontSize: '1.125rem',
                            fontWeight: 500,
                            margin: 0
                        }}>
                            Logging out...
                        </p>
                    </div>
                )}

                {/* Page Content */}
                <div style={{ flex: 1, padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.8)',
                        zIndex: 60
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: mobileMenuOpen ? 0 : '-100%',
                width: '280px',
                height: '100vh',
                background: '#0f172a',
                zIndex: 70,
                transition: 'left 0.3s ease',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>
                <nav style={{ padding: '1rem' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink
                                key={`mobile-${item.to}`}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    marginBottom: '0.5rem',
                                    textDecoration: 'none',
                                    color: isActive ? '#fff' : '#94a3b8',
                                    background: isActive ? '#3b82f6' : 'transparent',
                                    fontSize: '1rem',
                                    fontWeight: isActive ? 600 : 500
                                }}
                            >
                                <Icon size={22} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge && (
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: '#ef4444',
                                        color: '#fff'
                                    }}>{item.badge}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        display: none !important;
                    }
                    .admin-main-content {
                        margin-left: 0 !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .admin-search-box {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .admin-main-content header {
                        padding: 1rem !important;
                    }
                    .admin-main-content header h1 {
                        font-size: 1.25rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
