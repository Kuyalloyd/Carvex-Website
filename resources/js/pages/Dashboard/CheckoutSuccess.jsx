import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
    return (
        <div className="checkout-success">
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your purchase. We'll process your order soon.</p>
            <Link to="/dashboard/orders" className="btn btn-primary">View My Orders</Link>
        </div>
    );
}
