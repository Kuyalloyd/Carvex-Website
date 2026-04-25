import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await updateProfile({ name, phone, address });
            setMessage('Profile updated successfully');
        } catch (err) {
            setMessage('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <h1>My Profile</h1>
            {message && <div className="alert">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
