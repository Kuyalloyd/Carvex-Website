import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <Link to="/login" className="btn-back">← Back to Login</Link>
        </div>
        <p className="legal-updated">Last Updated: April 18, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using CarVex (the "Service"), you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            CarVex is an online marketplace for automotive parts and accessories. We provide a platform 
            for customers to browse, purchase, and receive genuine car parts from trusted brands.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account. You agree to notify us immediately of any unauthorized 
            use of your account.
          </p>
        </section>

        <section>
          <h2>4. Product Information</h2>
          <p>
            While we strive to provide accurate product information, we do not warrant that product descriptions, 
            images, or other content are error-free. All products are subject to availability.
          </p>
        </section>

        <section>
          <h2>5. Pricing and Payment</h2>
          <p>
            All prices are listed in Philippine Pesos (PHP). We reserve the right to modify prices at any time 
            without prior notice. Payment must be made before order processing begins.
          </p>
        </section>

        <section>
          <h2>6. Shipping and Delivery</h2>
          <p>
            Shipping times are estimates and not guaranteed. We are not responsible for delays caused by 
            shipping carriers, customs, or other factors outside our control. Risk of loss transfers to you 
            upon delivery to the shipping carrier.
          </p>
        </section>

        <section>
          <h2>7. Returns and Refunds</h2>
          <p>
            Returns are accepted within 7 days of delivery for defective or incorrectly shipped items. 
            Products must be in their original packaging and unused. Contact our support team at 
            support@carvex.ph for return authorization.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            CarVex shall not be liable for any indirect, incidental, special, or consequential damages 
            arising from the use of our products or services, to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>
            All content on this website, including text, images, logos, and designs, is the property of 
            CarVex and protected by copyright laws.
          </p>
        </section>

        <section>
          <h2>10. Privacy Policy</h2>
          <p>
            Your use of our Service is also governed by our <Link to="/privacy">Privacy Policy</Link>. 
            Please review it to understand how we collect, use, and protect your personal information.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Service after 
            changes constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
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
