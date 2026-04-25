import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';

export default function AdminCart() {
    return (
        <section style={{ border: '1px solid #dbe1ea', borderRadius: 14, background: '#ffffff', padding: 20, color: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Cart Route</h2>
                    <p style={{ margin: '6px 0 0', color: '#64748b' }}>Admin panel route for cart-related monitoring and flow checks.</p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#fff7ed', color: '#c2410c' }}>
                    <ShoppingCart size={22} />
                </div>
            </div>

            <div style={{ marginTop: 14, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', padding: 14 }}>
                <p style={{ margin: 0, color: '#334155' }}>
                    Customer carts are managed in the customer panel. For fulfillment and approval workflows, use the orders module.
                </p>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link to="/admin/orders" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10, background: '#f97316', color: '#ffffff', padding: '9px 12px', fontWeight: 800 }}>
                        <Package size={16} />
                        Go to Orders
                    </Link>
                </div>
            </div>
        </section>
    );
}
