import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Upload, Save, CheckCircle, AlertCircle, MapPin, Phone, Mail, CreditCard, Truck } from 'lucide-react';

export default function DashboardProfile() {
    const { user, updateProfile, uploadAvatar } = useAuth();
    const [firstName, setFirstName] = useState((user?.name || '').split(' ').slice(0, 1).join(' '));
    const [lastName, setLastName] = useState((user?.name || '').split(' ').slice(1).join(' '));
    const [phone, setPhone] = useState(user?.phone || '');
    const [city, setCity] = useState(user?.city || '');
    const [region, setRegion] = useState(user?.region || '');
    const [postalCode, setPostalCode] = useState(user?.postal_code || '');
    const [address, setAddress] = useState(user?.address || '');
    const [billingAddress, setBillingAddress] = useState(user?.billing_address || '');
    const [shippingAddress, setShippingAddress] = useState(user?.shipping_address || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const avatarUrl = useMemo(() => {
        const value = String(user?.avatar_url || '').trim();
        if (!value) return '';
        const timestamp = user?.avatar_updated_at || Date.now();
        return value.includes('?') ? `${value}&t=${timestamp}` : `${value}?t=${timestamp}`;
    }, [user?.avatar_url, user?.avatar_updated_at]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            await updateProfile({
                name: fullName || user?.name || '',
                phone,
                city,
                region,
                postal_code: postalCode,
                address,
                billing_address: billingAddress,
                shipping_address: shippingAddress,
            });
            setMessage('Profile updated successfully');
            setMessageType('success');
        } catch (err) {
            setMessage('Failed to update profile');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');
        setMessageType('');

        try {
            await uploadAvatar(file);
            setMessage('Profile picture uploaded successfully');
            setMessageType('success');
        } catch (error) {
            setMessage('Failed to upload profile picture');
            setMessageType('error');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    // Clean white color scheme
    const colors = {
        primary: '#f97316',
        accent: '#f97316',
        accentGradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        text: '#1e293b',
        textMuted: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        error: '#ef4444',
        cardBg: '#ffffff',
        inputBg: '#f8fafc',
        pageBg: '#f1f5f9',
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: colors.inputBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        color: colors.text,
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
    };

    const labelStyle = {
        color: colors.textMuted,
        fontSize: '13px',
        fontWeight: 500,
        marginBottom: '6px',
        display: 'block',
    };

    return (
        <div style={{ padding: '24px', background: colors.pageBg, minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
                    Profile Settings
                </h1>
                <p style={{ color: colors.textMuted, fontSize: 14, margin: 0 }}>
                    Manage your account information and preferences
                </p>
            </div>

            {/* Alert Messages */}
            {message && (
                <div style={{
                    marginBottom: 24,
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: messageType === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${messageType === 'success' ? colors.success : colors.error}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    {messageType === 'success' ? (
                        <CheckCircle size={20} color={colors.success} />
                    ) : (
                        <AlertCircle size={20} color={colors.error} />
                    )}
                    <span style={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>
                        {message}
                    </span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
                {/* Sidebar - Avatar Card */}
                <div>
                    <div style={{
                        background: colors.cardBg,
                        borderRadius: 12,
                        padding: 20,
                        border: `1px solid ${colors.border}`,
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            margin: '0 auto 16px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid #f97316',
                            background: colors.inputBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={48} color={colors.textMuted} />
                            )}
                        </div>

                        <h3 style={{ color: colors.text, fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>
                            {user?.name || 'User'}
                        </h3>
                        <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 16px' }}>
                            {user?.email || ''}
                        </p>

                        <label style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'block' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                                disabled={uploading}
                            />
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 16px',
                                background: colors.accentGradient,
                                borderRadius: 6,
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                opacity: uploading ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                            }}>
                                <Upload size={14} />
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </div>
                        </label>
                    </div>

                    {/* Quick Info Cards */}
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{
                            background: colors.cardBg,
                            borderRadius: 10,
                            padding: 14,
                            border: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: 'rgba(249, 115, 22, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Phone size={16} color={colors.accent} />
                            </div>
                            <div>
                                <p style={{ color: colors.textMuted, fontSize: 11, margin: '0 0 2px' }}>Phone</p>
                                <p style={{ color: colors.text, fontSize: 13, fontWeight: 500, margin: 0 }}>
                                    {user?.phone || 'Not set'}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            background: colors.cardBg,
                            borderRadius: 10,
                            padding: 14,
                            border: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: 'rgba(249, 115, 22, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <MapPin size={16} color={colors.accent} />
                            </div>
                            <div>
                                <p style={{ color: colors.textMuted, fontSize: 11, margin: '0 0 2px' }}>Location</p>
                                <p style={{ color: colors.text, fontSize: 13, fontWeight: 500, margin: 0 }}>
                                    {user?.city || 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div>
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div style={{
                            background: colors.cardBg,
                            borderRadius: 12,
                            padding: 20,
                            border: `1px solid ${colors.border}`,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <User size={18} color={colors.accent} />
                                </div>
                                <div>
                                    <h2 style={{ color: colors.text, fontSize: 16, fontWeight: 600, margin: 0 }}>
                                        Personal Information
                                    </h2>
                                    <p style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0 0' }}>
                                        Update your basic profile details
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', background: '#e2e8f0' }}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={inputStyle}
                                    placeholder="+63 xxx xxx xxxx"
                                />
                            </div>
                        </div>

                        {/* Location Information */}
                        <div style={{
                            background: colors.cardBg,
                            borderRadius: 12,
                            padding: 20,
                            border: `1px solid ${colors.border}`,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <MapPin size={18} color={colors.accent} />
                                </div>
                                <div>
                                    <h2 style={{ color: colors.text, fontSize: 16, fontWeight: 600, margin: 0 }}>
                                        Location Details
                                    </h2>
                                    <p style={{ color: colors.textMuted, fontSize: 12, margin: '2px 0 0' }}>
                                        Your address and location information
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        style={inputStyle}
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Region/State</label>
                                    <input
                                        type="text"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        style={inputStyle}
                                        placeholder="Region"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Postal Code</label>
                                    <input
                                        type="text"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        style={inputStyle}
                                        placeholder="ZIP"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Country</label>
                                    <input
                                        type="text"
                                        value="Philippines"
                                        disabled
                                        style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', background: '#e2e8f0' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Full Address</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                                    placeholder="Enter your complete address"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Address Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            {/* Billing Address */}
                            <div style={{
                                background: colors.cardBg,
                                borderRadius: 12,
                                padding: 20,
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <CreditCard size={16} color={colors.accent} />
                                    <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 600, margin: 0 }}>
                                        Billing Address
                                    </h3>
                                </div>
                                <textarea
                                    value={billingAddress}
                                    onChange={(e) => setBillingAddress(e.target.value)}
                                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                                    placeholder="Enter billing address (if different)"
                                    rows={4}
                                />
                            </div>

                            {/* Shipping Address */}
                            <div style={{
                                background: colors.cardBg,
                                borderRadius: 12,
                                padding: 20,
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Truck size={16} color={colors.accent} />
                                    <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 600, margin: 0 }}>
                                        Shipping Address
                                    </h3>
                                </div>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                                    placeholder="Enter shipping address (if different)"
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 24px',
                                    background: colors.accentGradient,
                                    border: 'none',
                                    borderRadius: 8,
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
