import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loginWithToken, user } = useAuth();
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for error from backend first
                const errorParam = searchParams.get('error');
                const errorDetail = searchParams.get('error_detail');
                const fullUrl = window.location.href;
                const search = window.location.search;
                
                // Store debug info
                setDebugInfo(`URL: ${fullUrl}\nError: ${errorParam}\nDetail: ${errorDetail || 'none'}`);
                
                console.log('Full URL:', fullUrl);
                console.log('Search params:', search);
                console.log('Error param:', errorParam);
                console.log('Error detail:', errorDetail);
                
                if (errorParam) {
                    const errorMessages = {
                        'google_auth_failed': 'Google authentication failed. Please check your Google credentials in .env file.',
                        'invalid_state': 'Invalid authentication state. Please try again.',
                        'access_denied': 'Access was denied. Please try again.'
                    };
                    let message = errorMessages[errorParam] || `Authentication error: ${errorParam}`;
                    if (errorDetail) {
                        message += `\n\nDetails: ${decodeURIComponent(errorDetail)}`;
                    }
                    setError(message);
                    console.error('OAuth error:', errorParam, errorDetail);
                    return;
                }

                // OAuth providers may return the token in query params or URL hash
                const token = searchParams.get('token') || 
                             new URLSearchParams(window.location.hash.substring(1)).get('access_token');
                
                if (!token) {
                    setError('No authentication token received. Please try again.');
                    console.error('No token in callback:', { search: window.location.search, hash: window.location.hash });
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // Store the token
                localStorage.setItem('auth_token', token);
                
                // Get user info to determine dashboard route
                try {
                    const result = await loginWithToken(token);
                    const isAdmin = result?.user?.role === 'admin' || result?.user?.is_admin === true || user?.role === 'admin';
                    
                    // Redirect admins to admin panel, customers to dashboard.
                    window.location.href = isAdmin ? '/admin/dashboard' : '/dashboard/overview';
                } catch (authErr) {
                    // Token is stored, redirect to dashboard
                    // User info will be fetched on next page load
                    window.location.href = '/dashboard/overview';
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Authentication failed. Please try again.');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, loginWithToken, user]);

    if (error) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-modal" style={{ maxWidth: '400px' }}>
                        <div className="auth-modal__body" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <div className="alert alert-danger" style={{ marginBottom: '20px', whiteSpace: 'pre-wrap', textAlign: 'left', fontSize: '14px' }}>
                                {error}
                            </div>
                            {debugInfo && (
                                <div style={{ marginBottom: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', textAlign: 'left', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                    <strong>Debug:</strong><br/>{debugInfo}
                                </div>
                            )}
                            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                                Redirecting to login...
                            </p>
                            <button 
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: '10px 20px',
                                    background: '#ff1c1c',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-modal" style={{ maxWidth: '400px' }}>
                    <div className="auth-modal__body" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div className="spinner-border" role="status" style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid rgba(255,28,28,0.2)',
                                borderTopColor: '#ff1c1c',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <p style={{ color: '#6b7280', fontWeight: '500' }}>Processing authentication...</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Please wait while we log you in</p>
                    </div>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
