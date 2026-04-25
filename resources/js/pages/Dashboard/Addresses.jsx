import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAddresses() {
    const { user, updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState(() => ({
        shipping_address: user?.shipping_address || user?.address || '',
        billing_address: user?.billing_address || user?.address || '',
        city: user?.city || '',
        region: user?.region || user?.state || '',
        postal_code: user?.postal_code || '',
    }));

    const isDirty = useMemo(() => {
        return (
            form.shipping_address !== (user?.shipping_address || user?.address || '') ||
            form.billing_address !== (user?.billing_address || user?.address || '') ||
            form.city !== (user?.city || '') ||
            form.region !== (user?.region || user?.state || '') ||
            form.postal_code !== (user?.postal_code || '')
        );
    }, [form, user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setSaving(true);
        try {
            await updateProfile({
                ...form,
                address: form.shipping_address || form.billing_address || '',
            });
            setMessage('Addresses updated successfully.');
        } catch (error) {
            setMessage(error?.response?.data?.message || 'Failed to update addresses.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section style={{ background: '#ffffff', border: '1px solid #dbe1ea', borderRadius: 14, padding: '1.2rem 1.25rem', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Addresses</h2>
            <p style={{ margin: '0.45rem 0 0.9rem', color: '#64748b', fontSize: 14 }}>Manage your delivery and billing details.</p>

            {message && (
                <p style={{ margin: '0 0 0.9rem', color: message.toLowerCase().includes('success') ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#334155', fontWeight: 700 }}>Shipping Address</span>
                    <input name="shipping_address" value={form.shipping_address} onChange={handleChange} style={{ height: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px' }} />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#334155', fontWeight: 700 }}>Billing Address</span>
                    <input name="billing_address" value={form.billing_address} onChange={handleChange} style={{ height: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px' }} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ color: '#334155', fontWeight: 700 }}>City</span>
                        <input name="city" value={form.city} onChange={handleChange} style={{ height: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px' }} />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ color: '#334155', fontWeight: 700 }}>Region</span>
                        <input name="region" value={form.region} onChange={handleChange} style={{ height: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px' }} />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ color: '#334155', fontWeight: 700 }}>Postal Code</span>
                        <input name="postal_code" value={form.postal_code} onChange={handleChange} style={{ height: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 12px' }} />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={saving || !isDirty}
                    style={{
                        justifySelf: 'start',
                        marginTop: 4,
                        border: 'none',
                        borderRadius: 10,
                        background: saving || !isDirty ? '#94a3b8' : '#f97316',
                        color: '#ffffff',
                        fontWeight: 800,
                        padding: '10px 16px',
                        cursor: saving || !isDirty ? 'not-allowed' : 'pointer',
                    }}
                >
                    {saving ? 'Saving...' : 'Save Addresses'}
                </button>
            </form>
        </section>
    );
}
