import React, { useState } from 'react';
import supportService from '../services/supportService';

export default function CustomerService() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await supportService.submitInquiry({ name, email, message });
            setSubmitted(true);
        } catch (err) {
            alert('Failed to submit inquiry');
        }
    };

    return (
        <div className="customer-service-page">
            <h1>Customer Service</h1>
            {submitted ? (
                <div className="success-message">
                    <p>Thank you for your inquiry. We'll get back to you soon.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Submit Inquiry
                    </button>
                </form>
            )}
        </div>
    );
}
