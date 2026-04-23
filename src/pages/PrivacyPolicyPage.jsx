import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const CONTACT_EMAIL = 'privacy@harmohelp.com';
const LAST_UPDATED  = 'April 19, 2025';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-black text-navy mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEF]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
          <Heart size={18} fill="white" /> HarmoHelp
        </Link>
        <span className="text-gray-500 text-sm font-medium">Legal</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-navy mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-black text-navy mb-1">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-10">
            HarmoHelp ("we", "us", or "our") is committed to protecting your personal information. This Privacy
            Policy explains what data we collect, why we collect it, how it is stored, and your rights with
            respect to that data. By using HarmoHelp you agree to the practices described here.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following categories of information when you use HarmoHelp:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-navy">Account information:</strong> Your full name and email address, provided at registration.</li>
              <li><strong className="text-navy">Onboarding data:</strong> Date of birth, phone number, and emergency contact details you optionally provide during onboarding.</li>
              <li><strong className="text-navy">Health and symptom data:</strong> Symptoms you log, severity scores, mood, energy, sleep ratings, and free-text notes you enter in the Symptom Tracker.</li>
              <li><strong className="text-navy">Community content:</strong> Posts and comments you publish in the Community Hub.</li>
              <li><strong className="text-navy">Consultation bookings:</strong> Appointment type, date, time, and notes associated with bookings you create.</li>
              <li><strong className="text-navy">Order and payment data:</strong> Products purchased, order totals, and payment identifiers returned by our payment processor. We do not store raw card details on our servers.</li>
              <li><strong className="text-navy">Usage data:</strong> Standard server logs including IP address, browser type, and pages visited, retained for up to 30 days for security and debugging purposes.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect solely to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Operate and personalise your HarmoHelp account and dashboard.</li>
              <li>Display your symptom history and generate health trend charts.</li>
              <li>Facilitate consultation bookings and order fulfilment.</li>
              <li>Send transactional emails (password resets, order confirmations). We do not send marketing emails without explicit opt-in.</li>
              <li>Detect and prevent fraud, abuse, or security incidents.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
          </Section>

          <Section title="3. How Your Data Is Stored and Protected">
            <p>
              All data is stored on secured servers. Passwords are hashed using the Argon2id algorithm — we
              never store plain-text passwords. Data transmitted between your browser and our servers is
              encrypted in transit using TLS. Access to the production database is restricted to authorised
              personnel only.
            </p>
            <p>
              Authentication uses short-lived access tokens (15 minutes) and rotating refresh tokens stored in
              HttpOnly cookies, which are inaccessible to JavaScript and resistant to cross-site scripting attacks.
            </p>
          </Section>

          <Section title="4. We Never Sell Your Data">
            <p>
              HarmoHelp does not sell, rent, trade, or otherwise transfer your personal information or health
              data to third parties for commercial purposes. Your health data is yours. We treat it as sensitive
              information and handle it accordingly.
            </p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use a limited number of third-party services to operate the platform:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-navy">Razorpay</strong> — our payment processor. When you make a purchase,
                your card details are submitted directly to Razorpay's secure servers. HarmoHelp only receives
                a payment confirmation and a payment ID; we never see or store your full card number, CVV, or
                expiry date. Razorpay's privacy policy is available at{' '}
                <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-navy underline">razorpay.com/privacy</a>.
              </li>
              <li>
                <strong className="text-navy">Unsplash</strong> — product and editorial images are served from
                Unsplash's CDN. No personal data is shared with Unsplash.
              </li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>HarmoHelp uses the following cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-navy">refresh_token (HttpOnly, Strict):</strong> A secure session cookie
                used to maintain your login session. It is never accessible to JavaScript and expires after 7 days
                or on logout.
              </li>
              <li>
                <strong className="text-navy">cookie_consent (localStorage):</strong> Stores your cookie preference
                locally in your browser so we do not ask again. No data is sent to our servers.
              </li>
            </ul>
            <p>
              We do not use advertising, tracking, or analytics cookies. If you decline cookies, the platform
              will still function but you will need to sign in on each visit.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account and health data for as long as your account is active. If you request
              deletion, we will remove your personal data and health records within 30 days, except where
              retention is required by law (e.g. financial records for tax purposes, which are retained for
              7 years per Indian accounting regulations).
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-navy">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-navy">Correction:</strong> Ask us to correct inaccurate or incomplete data.</li>
              <li><strong className="text-navy">Deletion:</strong> Request that we delete your account and all associated data.</li>
              <li><strong className="text-navy">Portability:</strong> Request an export of your health data in a machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">{CONTACT_EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              HarmoHelp is not directed at children under the age of 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us with personal information,
              contact us immediately and we will delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated"
              date at the top of this page. Continued use of HarmoHelp after changes are posted constitutes
              your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:</p>
            <div className="bg-[#FFFBEF] rounded-xl p-5 mt-3 border border-[#E8D88A]">
              <p className="font-semibold text-navy mb-1">HarmoHelp Privacy Team</p>
              <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">{CONTACT_EMAIL}</a></p>
              <p className="text-gray-400 text-xs mt-2">We aim to respond to all privacy enquiries within 30 days.</p>
            </div>
          </Section>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © {new Date().getFullYear()} HarmoHelp. All rights reserved. ·{' '}
          <Link to="/terms" className="hover:text-navy underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
