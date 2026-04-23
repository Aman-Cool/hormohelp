import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, AlertTriangle } from 'lucide-react';

const CONTACT_EMAIL = 'legal@harmohelp.com';
const LAST_UPDATED  = 'April 19, 2025';

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-black text-navy mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-black text-navy mb-1">Terms of Service</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          {/* Health disclaimer — prominent callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex gap-3">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 mb-1">Important Health Disclaimer</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                HarmoHelp is an educational and wellness tracking platform. It is <strong>not a medical
                service</strong> and is <strong>not a substitute for professional medical advice,
                diagnosis, or treatment</strong>. Nothing on this platform should be construed as medical
                advice. Always seek the guidance of a qualified healthcare professional with any questions
                you may have regarding a medical condition. Never disregard professional medical advice or
                delay seeking it because of something you have read on HarmoHelp.
              </p>
            </div>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account on HarmoHelp or by otherwise accessing or using the platform, you confirm
              that you are at least 13 years of age, that you have read and understood these Terms of Service,
              and that you agree to be bound by them. If you do not agree, you must not use HarmoHelp.
            </p>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the platform after
              changes are posted constitutes your acceptance of the revised Terms. The "Last updated" date
              at the top of this page will always reflect the most recent revision.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>HarmoHelp provides:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A symptom and wellness tracking dashboard for personal health logging.</li>
              <li>Educational content about hormonal health for informational purposes.</li>
              <li>A community forum for peer discussion and shared experiences.</li>
              <li>A marketplace for health and wellness products.</li>
              <li>A consultation booking tool to connect users with healthcare professionals.</li>
            </ul>
            <p>
              All features are provided "as is" and are subject to change, suspension, or discontinuation
              without prior notice.
            </p>
          </Section>

          <Section title="3. Health Disclaimer">
            <p>
              <strong className="text-navy">HarmoHelp is not a medical device, medical service, or healthcare provider.</strong>{' '}
              The platform does not provide medical diagnoses, clinical assessments, prescriptions, or
              therapeutic recommendations of any kind.
            </p>
            <p>
              Information and content on HarmoHelp, including symptom tracking outputs, educational articles,
              and community posts, are provided for general informational and educational purposes only. They
              do not constitute medical advice and must not be relied upon as a substitute for professional
              medical evaluation or treatment.
            </p>
            <p>
              If you are experiencing a medical emergency, call your local emergency services immediately.
              If you have concerns about your health, consult a qualified doctor or licensed healthcare
              professional. Do not make changes to your medication, diet, or treatment plan based solely on
              information obtained from HarmoHelp.
            </p>
            <p>
              Third-party healthcare professionals accessible through the Consultations feature operate
              independently. HarmoHelp facilitates the booking but is not responsible for the advice,
              diagnosis, or treatment provided during those consultations.
            </p>
          </Section>

          <Section title="4. User Responsibilities">
            <p>By using HarmoHelp you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate, current, and complete registration information and keep it up to date.</li>
              <li>Maintain the confidentiality of your account credentials and notify us immediately if you suspect unauthorised access.</li>
              <li>Use the platform only for lawful purposes and in a manner consistent with these Terms.</li>
              <li>Not post content that is defamatory, harassing, abusive, threatening, obscene, or otherwise objectionable.</li>
              <li>Not impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Not upload or transmit viruses, malicious code, or any content that interferes with the platform's operation.</li>
              <li>Not attempt to gain unauthorised access to any part of the platform, its servers, or any connected systems.</li>
              <li>Not scrape, crawl, or harvest data from the platform without express written permission.</li>
            </ul>
            <p>
              You are solely responsible for all content you submit and for any consequences arising from it.
            </p>
          </Section>

          <Section title="5. Community Content">
            <p>
              The Community Hub is a peer-support forum. Posts and comments reflect the views of individual
              users and do not represent the views of HarmoHelp. Community content is not a source of medical
              advice.
            </p>
            <p>
              By posting in the community you grant HarmoHelp a non-exclusive, royalty-free, worldwide licence
              to display and distribute that content within the platform. We reserve the right to remove any
              content that violates these Terms or our community guidelines at our sole discretion.
            </p>
          </Section>

          <Section title="6. Purchases and Payments">
            <p>
              Products listed in the HarmoHelp shop are sold subject to availability. Prices are displayed in
              Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve
              the right to change prices at any time.
            </p>
            <p>
              Payments are processed by Razorpay. By making a purchase you agree to Razorpay's terms of
              service. HarmoHelp does not store card details. All sales are final unless the product is
              defective or materially different from its description, in which case contact us within 7 days
              of receipt.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on HarmoHelp — including but not limited to text, graphics, logos, icons, images,
              and software — is the property of HarmoHelp or its content suppliers and is protected by
              applicable intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or
              exploit any part of the platform for commercial purposes without our express written consent.
              Personal, non-commercial use is permitted provided you do not remove any proprietary notices.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              We may suspend or terminate your account at any time, with or without notice, if we reasonably
              believe you have violated these Terms, engaged in fraudulent or abusive behaviour, or if
              continued access poses a risk to the platform or other users.
            </p>
            <p>
              You may delete your account at any time by contacting us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">{CONTACT_EMAIL}</a>.
              Upon termination, your right to use the platform ceases immediately. Sections of these Terms
              that by their nature should survive termination will continue to apply.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              HarmoHelp is provided on an "as is" and "as available" basis without warranties of any kind,
              either express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              We do not warrant that the platform will be uninterrupted, error-free, or free of viruses or
              other harmful components. We do not warrant the accuracy, completeness, or usefulness of any
              information on the platform.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, HarmoHelp and its officers, directors,
              employees, and agents shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages — including loss of profits, data, goodwill, or health outcomes — arising
              out of or in connection with your use of the platform, even if advised of the possibility of
              such damages.
            </p>
            <p>
              Our total liability to you for any claim arising from these Terms or your use of HarmoHelp
              shall not exceed the amount you paid to HarmoHelp in the twelve months preceding the claim,
              or ₹1,000, whichever is greater.
            </p>
          </Section>

          <Section title="11. Governing Law and Disputes">
            <p>
              These Terms are governed by and construed in accordance with the laws of India, without regard
              to its conflict of law provisions. Any dispute arising out of or relating to these Terms or the
              use of HarmoHelp shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
            <p>
              Before initiating any legal proceeding, you agree to first contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">{CONTACT_EMAIL}</a>{' '}
              and give us 30 days to attempt to resolve the dispute informally.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>For questions about these Terms, please contact:</p>
            <div className="bg-[#FFFBEF] rounded-xl p-5 mt-3 border border-[#E8D88A]">
              <p className="font-semibold text-navy mb-1">HarmoHelp Legal Team</p>
              <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">{CONTACT_EMAIL}</a></p>
              <p className="text-gray-400 text-xs mt-2">We aim to respond to all legal enquiries within 30 days.</p>
            </div>
          </Section>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © {new Date().getFullYear()} HarmoHelp. All rights reserved. ·{' '}
          <Link to="/privacy" className="hover:text-navy underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
