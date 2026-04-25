import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Flame, Sparkles, Package, GitCompare, Truck } from 'lucide-react';

export default function Header() {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeNav, setActiveNav] = useState('Home');
    const homePath = '/'; // Always go to landing page

    useEffect(() => {
        if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) {
            setActiveNav('Home');
            return;
        }

    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const isSameRoute = (to) => {
        const [path, query = ''] = to.split('?');
        const targetSearch = query ? `?${query}` : '';
        return location.pathname === path && location.search === targetSearch;
    };

    const preventDuplicateNavigation = (to, event) => {
        if (isSameRoute(to)) {
            event.preventDefault();
        }
    };

    const handleHomeClick = (event) => {
        setActiveNav('Home');

        if (location.pathname === '/') {
            event.preventDefault();
            if (window.location.hash) {
                window.history.replaceState(null, '', `${location.pathname}${location.search}`);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const navGroups = [
        { label: 'Home', to: '/' },
        { label: 'Shop', to: '/products' },
        { label: 'Categories', to: '/#landing-categories' },
        { label: 'Deals', to: '/#landing-deals' },
        { label: 'Contact', to: '/#landing-contact' },
    ];

    return (
        <header className="site-header">
            <div className="header-top">
                <div className="header-inner">
                    <Link to={homePath} className="brand-logo" aria-label="CarVex home">
                        <span className="brand-mark">CV</span>
                        <div className="brand-details">
                            <span className="brand-name">CarVex</span>
                            <span className="brand-tagline">PREMIUM AUTO PARTS</span>
                        </div>
                    </Link>

                    <form className="search-form" onSubmit={handleSearch}>
                        <span className="search-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by part name, brand, or vehicle model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="search-clear"
                                aria-label="Clear search"
                                onClick={() => setSearchQuery('')}
                            >
                                <span aria-hidden="true">x</span>
                            </button>
                        )}
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </form>

                    <div className="header-actions">
                        {isAuthenticated ? (
                            <button className="action-link" onClick={() => {
                                localStorage.removeItem('auth_token');
                                localStorage.removeItem('auth_user');
                                localStorage.removeItem('auth_validated_at');
                                window.location.href = '/';
                            }}>
                                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        ) : (
                            <Link to="/login" className="action-link">
                                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <nav className="header-nav" aria-label="Primary">
                <div className="header-nav-inner">
                    {navGroups.map((group) => (
                        <div className="nav-item" key={group.label}>
                            {group.to.startsWith('/#') ? (
                                <a
                                    href={group.to}
                                    className={`nav-link ${activeNav === group.label ? 'active' : ''}`}
                                    onClick={() => setActiveNav(group.label)}
                                >
                                    {group.label}
                                </a>
                            ) : (
                                <Link
                                    to={group.to}
                                    className={`nav-link ${activeNav === group.label ? 'active' : ''}`}
                                    onClick={(event) => {
                                        if (group.label === 'Home') {
                                            handleHomeClick(event);
                                            return;
                                        }

                                        setActiveNav(group.label);
                                        preventDuplicateNavigation(group.to, event);
                                    }}
                                >
                                    {group.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </nav>
        </header>
    );
}
