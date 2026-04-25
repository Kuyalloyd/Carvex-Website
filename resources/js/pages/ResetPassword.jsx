import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token, password });
            setMessage('Password reset successful. Redirecting to login...');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-modal">
                    <div className="auth-modal__header">
                        <p className="auth-modal__back-link">
                            <Link to="/" className="auth-link">Back to Home</Link>
                        </p>
                        <h1>Reset Password</h1>
                        <p className="auth-modal__subtitle">Enter your new password below</p>
                    </div>
                    <div className="auth-modal__body">
                        {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="passwordConfirmation">Confirm Password</label>
                                <input
                                    id="passwordConfirmation"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-block" 
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                        <div className="auth-footer">
                            <p>Back to <Link to="/login" className="auth-link">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
