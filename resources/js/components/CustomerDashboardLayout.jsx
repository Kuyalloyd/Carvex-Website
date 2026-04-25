import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, Heart, Wallet, ShoppingCart, Search, Store, Settings, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CustomerDashboardLayout() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileMenuRef = useRef(null);
    const mobileNavRef = useRef(null);

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
            window.location.href = '/';
        }
    };

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: User, end: true },
        { to: '/dashboard/products', label: 'Products', icon: Store },
        { to: '/dashboard/orders', label: 'My Purchase', icon: Package },
        { to: '/dashboard/wishlist', label: 'My Wishlist', icon: Heart },
        { to: '/dashboard/wallet', label: 'Carvex Wallet', icon: Wallet },
    ];

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        navigate(query ? `/dashboard/products?search=${encodeURIComponent(query)}` : '/dashboard/products');
    };

    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }

        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // Close mobile nav when clicking outside
    useEffect(() => {
        if (!mobileNavOpen) {
            return undefined;
        }

        const handleClickOutside = (event) => {
            if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
                setMobileNavOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileNavOpen]);

    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Top Navbar */}
            <header style={{
                background: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                padding: '0 2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff6b35' }}>carvex</span>
                    </Link>

                    {/* Hamburger Menu Button (Mobile) */}
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#374151'
                        }}
                        className="hamburger-btn"
                    >
                        {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ display: 'flex', gap: '1.5rem' }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={`${item.to}-${item.label}`}
                                to={item.to}
                                end={item.end}
                                style={({ isActive }) => ({
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: isActive ? '#ff6b35' : '#374151',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    background: isActive ? '#fff1eb' : 'transparent',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    whiteSpace: 'nowrap'
                                })}
                            >
                                {({ isActive }) => {
                                    const Icon = item.icon;
                                    return (
                                        <>
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </>
                                    );
                                }}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right side: Search, Cart, Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search..."
                            style={{
                                padding: '0.4rem 0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                width: '140px'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: '#ff6b35',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginLeft: '0.3rem'
                            }}
                        >
                            <Search size={16} />
                        </button>
                    </form>

                    <div
                        ref={profileMenuRef}
                        style={{ position: 'relative' }}
                    >
                        <Link
                            to="/dashboard/cart"
                            style={{ position: 'relative', color: '#374151' }}
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: -7,
                                        right: -7,
                                        minWidth: 18,
                                        height: 18,
                                        borderRadius: 999,
                                        display: 'grid',
                                        placeItems: 'center',
                                        padding: '0 5px',
                                        background: '#f97316',
                                        color: '#ffffff',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        lineHeight: 1,
                                    }}
                                >
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div ref={profileMenuRef} style={{ position: 'relative' }}>
                        <ProfileTrigger user={user} onClick={() => setMenuOpen(!menuOpen)} />

                        {menuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                minWidth: '150px',
                                zIndex: 1000
                            }}>
                                <Link
                                    to="/dashboard/profile"
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 1rem',
                                        textDecoration: 'none',
                                        color: '#374151',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    type="button"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'none',
                                        border: 'none',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileNavOpen && (
                <div
                    ref={mobileNavRef}
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: '64px',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        zIndex: 99,
                        padding: '1rem'
                    }}
                    className="mobile-nav-dropdown"
                >
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={`mobile-${item.to}-${item.label}`}
                                to={item.to}
                                end={item.end}
                                onClick={() => setMobileNavOpen(false)}
                                style={({ isActive }) => ({
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: isActive ? '#ff6b35' : '#374151',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    background: isActive ? '#fff1eb' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                })}
                            >
                                {({ isActive }) => {
                                    const Icon = item.icon;
                                    return (
                                        <>
                                            <Icon size={20} />
                                            <span>{item.label}</span>
                                        </>
                                    );
                                }}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
            </header>

            <style>{`
                @media (max-width: 1024px) {
                    .hamburger-btn {
                        display: block !important;
                    }
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-nav-dropdown {
                        display: block !important;
                    }
                }
            `}</style>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '1.5rem 2rem' }}>
                <Outlet />
            </main>
        </div>
        </>
    );
}

function ProfileTrigger({ user, onClick }) {
    const avatarUrl = useMemo(() => {
        const value = String(user?.avatar_url || '').trim();
        if (!value) return '';
        const timestamp = user?.avatar_updated_at || Date.now();
        return value.includes('?') ? `${value}&t=${timestamp}` : `${value}?t=${timestamp}`;
    }, [user?.avatar_url, user?.avatar_updated_at]);

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
            }}
        >
            <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f3f4f6'
            }}>
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={user?.name || 'Customer'}
                        style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            borderRadius: '50%'
                        }}
                    />
                ) : (
                    <User size={20} />
                )}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{user?.name || 'Customer'}</span>
        </button>
    );
}
