import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is HarmoHelp?',
        a: 'HarmoHelp is a hormonal health and wellness platform designed to help you track symptoms, understand patterns in your health data, access educational resources, connect with a community, and book consultations with health experts — all in one place.',
      },
      {
        q: 'Do I need to complete onboarding before using the app?',
        a: 'Yes. The onboarding questionnaire helps HarmoHelp tailor your experience — including insights and recommendations — to your specific health profile. You can update your onboarding data any time through your profile settings.',
      },
      {
        q: 'Is my email verification required?',
        a: 'Yes. You must verify your email address before accessing the dashboard and any protected features. Check your inbox after sign-up and click the verification link. If you didn\'t receive it, you can request a new one from the verify email screen.',
      },
    ],
  },
  {
    category: 'Symptom Tracking',
    items: [
      {
        q: 'How do I log my symptoms?',
        a: 'Go to Track Symptoms in the navigation bar. Select any symptoms you\'re experiencing from the checklist, then set your severity, mood, energy, and sleep scores using the sliders. Add optional notes, then hit Save Entry. Your log is saved and reflected on your dashboard immediately.',
      },
      {
        q: 'How many times can I log symptoms in a day?',
        a: 'You can log up to 2 entries per day. This limit exists to keep your data meaningful and avoid accidental duplicate entries. If you\'ve already logged twice today, the save button will be disabled until tomorrow.',
      },
      {
        q: 'What do the severity, mood, energy, and sleep scores mean?',
        a: 'All four scores use a 1–10 scale. Severity (1 = very mild symptoms, 10 = very severe), Mood (1 = very low, 10 = excellent), Energy (1 = completely drained, 10 = very energetic), Sleep (1 = very poor, 10 = excellent). Be consistent with how you rate these so your trend charts remain accurate.',
      },
      {
        q: 'Can I delete a symptom log entry?',
        a: 'Yes. In the Symptom Tracker page, your recent logs are listed at the bottom. Each entry has a delete option. Deleting an entry is permanent and will update your dashboard stats immediately.',
      },
    ],
  },
  {
    category: 'Dashboard & Insights',
    items: [
      {
        q: 'What is the streak counter on my dashboard?',
        a: 'Your streak counts how many consecutive days you\'ve logged at least one symptom entry. It resets if you miss a day. Building a longer streak gives you richer trend data, which makes the insights and charts on your dashboard more accurate.',
      },
      {
        q: 'How are the charts and trend lines calculated?',
        a: 'The line chart shows your average severity over your last 7 logged days. The bar chart shows your weekly activity — how many entries you logged each day of the current week. All calculations use only your personal data and are never averaged with other users.',
      },
      {
        q: 'Why does my total symptom count look different from what I expect?',
        a: 'The total reflects the actual number of symptom log entries in the database — not the number of individual symptoms selected per entry. If you logged twice on one day, that counts as 2.',
      },
    ],
  },
  {
    category: 'Community',
    items: [
      {
        q: 'How do I post in the Community Hub?',
        a: 'Navigate to Community in the nav bar. Click the New Post button, choose a category, write your title and body, then submit. Your post will appear in the feed immediately.',
      },
      {
        q: 'Can I like or comment on other people\'s posts?',
        a: 'Yes. Each post has a like button and a comment section. Click the heart icon to like a post and use the reply field to leave a comment. You can also unlike a post by clicking the heart again.',
      },
      {
        q: 'Are community posts public to all users?',
        a: 'Community posts are visible to all verified HarmoHelp users. They are not visible to the general public or to anyone who is not logged in.',
      },
    ],
  },
  {
    category: 'Consultations & Shop',
    items: [
      {
        q: 'How do I book a consultation?',
        a: 'Go to Consultations in the nav bar. Choose your preferred consultation type (video, phone, or chat), pick an available date and time slot, add any notes for the expert, and confirm your booking. You\'ll see your upcoming bookings listed on the same page.',
      },
      {
        q: 'How does payment work in the Shop?',
        a: 'HarmoHelp uses Razorpay for secure payment processing. Add products to your cart, proceed to checkout, and you\'ll be taken through the Razorpay payment flow. Orders are recorded and visible in your order history on the dashboard.',
      },
    ],
  },
  {
    category: 'Privacy & Account',
    items: [
      {
        q: 'Is my health data private?',
        a: 'Yes. Your symptom logs, scores, notes, and onboarding data are stored securely and are never shared with other users or third parties. Only you can see your personal health data.',
      },
      {
        q: 'How do I update my name, bio, or profile picture?',
        a: 'Go to Settings from the avatar menu in the top-right corner of the navigation bar. You can upload a new profile picture, change your display name, and update your bio from the Settings page.',
      },
      {
        q: 'How do I log out?',
        a: 'Click your avatar in the top-right corner of the nav bar and select Log out from the dropdown. You can also log out from the bottom of the Settings page. You\'ll be redirected to the home page.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="text-sm font-semibold text-navy pr-4">{q}</span>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = faqs.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-navy flex items-center gap-2">
              <HelpCircle size={22} className="text-[#D4B83A]" /> Frequently Asked Questions
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Find answers to common questions about HarmoHelp</p>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-[#D4B83A] focus:border-transparent mb-8"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No questions match your search.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {filtered.map((section) => (
              <div key={section.category}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {section.category}
                </h2>
                <div className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
