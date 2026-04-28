import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerService() {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <div className="customer-service-page">
            <div className="container">
                <section className="customer-service-hero">
                    <div className="customer-service-hero__content">
                        <p className="customer-service-kicker">Support Center</p>
                        <h1>Reach the admin team through your CarVex account.</h1>
                        <p>
                            CarVex support now works through your customer dashboard so your concerns, updates, and admin replies stay in one secure place.
                        </p>
                        <div className="customer-service-hero__actions">
                            {isAuthenticated && !isAdmin ? (
                                <>
                                    <Link to="/dashboard/support" className="btn btn-primary">
                                        Open Support Inbox
                                    </Link>
                                    <Link to="/dashboard/orders" className="btn btn-outline-light">
                                        View Orders
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-primary">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn btn-outline-light">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="customer-service-hero__panel">
                        <div className="support-tile">
                            <span className="support-tile__label">Best for</span>
                            <strong>Order questions, product issues, account concerns, and admin follow-up</strong>
                        </div>
                        <div className="support-tile">
                            <span className="support-tile__label">Where replies appear</span>
                            <strong>Your dashboard support inbox</strong>
                        </div>
                        <div className="support-tile">
                            <span className="support-tile__label">Account needed</span>
                            <strong>Yes, so the admin can identify and respond to the right customer</strong>
                        </div>
                    </div>
                </section>

                <div className="customer-service-grid">
                    <article className="customer-service-card customer-service-card--featured">
                        <div className="customer-service-card__header">
                            <h2>How support works now</h2>
                            <p>Everything stays connected to your CarVex customer account.</p>
                        </div>
                        <div className="customer-service-list">
                            <article>
                                <h3>1. Open a ticket inside your dashboard</h3>
                                <p>Use a clear subject and explain the issue so the admin can review it faster.</p>
                            </article>
                            <article>
                                <h3>2. Admin reviews and replies</h3>
                                <p>The admin can answer your ticket directly from the admin panel and update its status.</p>
                            </article>
                            <article>
                                <h3>3. Read the reply in your support inbox</h3>
                                <p>You can come back to the dashboard any time to check the latest reply and ticket progress.</p>
                            </article>
                        </div>
                    </article>

                    <article className="customer-service-card customer-service-card--contact">
                        <div className="customer-service-card__header">
                            <h2>Before you contact support</h2>
                            <p>These details help the admin solve your issue faster.</p>
                        </div>
                        <ul>
                            <li>Include your order number if the issue is about delivery or payment.</li>
                            <li>Mention the exact product name if the issue is about fitment or availability.</li>
                            <li>Use one ticket per issue so the replies stay organized.</li>
                        </ul>
                    </article>

                    <article className="customer-service-card customer-service-card--form">
                        <div className="customer-service-card__header">
                            <h2>{isAuthenticated && !isAdmin ? 'Continue in your dashboard' : 'Sign in to contact the admin team'}</h2>
                            <p>
                                {isAuthenticated && !isAdmin
                                    ? 'Your support inbox is ready. Open it to send a concern and read admin replies.'
                                    : 'Support communication is tied to your customer account so replies stay secure and attached to the right person.'}
                            </p>
                        </div>

                        <div className="customer-service-login-prompt">
                            {isAuthenticated && !isAdmin ? (
                                <Link to="/dashboard/support" className="btn btn-primary btn-block">
                                    Open Dashboard Support
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-primary btn-block">
                                        Sign In to Continue
                                    </Link>
                                    <Link to="/register" className="btn btn-secondary btn-block">
                                        Create a Customer Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
