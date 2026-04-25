import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function DashboardWishlist() {
    return (
        <section style={{ background: '#ffffff', border: '1px solid #dbe1ea', borderRadius: 14, padding: '1.2rem 1.25rem', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>My Wishlist</h2>
            <p style={{ margin: '0.45rem 0 0', color: '#64748b', fontSize: 14 }}>Save favorite parts and buy them anytime.</p>

            <div style={{ marginTop: 16, border: '1px dashed #cbd5e1', borderRadius: 12, padding: '1.1rem', background: '#f8fafc' }}>
                <div style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: 999, background: '#fff1f2', color: '#e11d48', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={18} />
                </div>
                <p style={{ margin: '0.7rem 0 0', color: '#334155', fontWeight: 700 }}>No wishlist items yet.</p>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>Browse products and start adding your favorites.</p>
                <Link to="/dashboard/products" style={{ display: 'inline-block', marginTop: 12, padding: '9px 14px', borderRadius: 10, background: '#f97316', color: '#ffffff', textDecoration: 'none', fontWeight: 700 }}>
                    Browse Products
                </Link>
            </div>
        </section>
    );
}
