import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <Link to="/login" className="btn-back">← Back to Login</Link>
        </div>
        <p className="legal-updated">Last Updated: April 18, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, make a purchase, 
            or contact us. This includes your name, email address, phone number, shipping address, and payment information.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to process your orders, provide customer support, improve our services, 
            and send you promotional communications (with your consent). We may also use your information to prevent fraud 
            and ensure the security of our platform.
          </p>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information to third parties. We may share your information with:
          </p>
          <ul>
            <li>Shipping carriers to deliver your orders</li>
            <li>Payment processors to process transactions</li>
            <li>Service providers who assist in operating our website</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, 
            alteration, or destruction. This includes encryption, secure servers, and regular security audits.
          </p>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to improve your browsing experience, analyze site traffic, and 
            personalize content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. You may also opt out of 
            marketing communications at any time. To exercise these rights, contact us at support@carvex.ph.
          </p>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>
            Our website may contain links to third-party services, including Google OAuth for authentication. 
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect personal information 
            from children under 13. If we become aware of such collection, we will take steps to delete it.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any material changes by 
            posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Information</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: support@carvex.ph</li>
            <li>Phone: +63 9395158432</li>
            <li>Address: Agusan del Norte, Butuan City, Philippines</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
