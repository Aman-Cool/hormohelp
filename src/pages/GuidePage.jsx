import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, LayoutDashboard, Activity,
  TrendingUp, Users, Calendar, ShoppingBag, UserCircle,
  CheckCircle,
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const sections = [
  {
    id: 'getting-started',
    icon: CheckCircle,
    title: 'Getting Started',
    intro: 'Set up your account and get familiar with the app in a few minutes.',
    steps: [
      {
        heading: 'Create your account',
        body: 'Sign up with your email address or Google account. After signing up with email, check your inbox for a verification link — you must verify before accessing the dashboard.',
      },
      {
        heading: 'Complete onboarding',
        body: 'Once verified, you\'ll be guided through a short onboarding questionnaire. This helps HarmoHelp personalise your experience — including insights and recommendations. Take your time and answer honestly; you can update your answers later from Settings.',
      },
      {
        heading: 'Land on your dashboard',
        body: 'After onboarding you\'ll arrive at the main dashboard. From here you can see your stats, recent activity, and quick links to every feature.',
      },
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Your Dashboard',
    intro: 'The dashboard is your health at a glance.',
    steps: [
      {
        heading: 'Stat cards',
        body: 'Four cards at the top show your total symptoms logged, current streak, average severity, and recent order count. These update in real time as you log new entries.',
      },
      {
        heading: 'Trend charts',
        body: 'The line chart shows your average severity score across your last 7 logged days. The bar chart shows how many entries you logged on each day of the current week. Both charts are empty until you have at least one log.',
      },
      {
        heading: 'Quick links',
        body: 'Below the charts are shortcut cards for every major feature — Symptom Tracker, Education, Community, Consultations, and Shop. Click any card to jump straight there.',
      },
    ],
  },
  {
    id: 'symptom-tracker',
    icon: Activity,
    title: 'Tracking Symptoms',
    intro: 'The Symptom Tracker is the core of HarmoHelp. Log your daily health data to build a picture of your patterns over time.',
    steps: [
      {
        heading: 'Select your symptoms',
        body: 'Tap any symptom from the checklist to select it — selected symptoms are highlighted in navy. Common options include mood swings, fatigue, cramps, hot flashes, anxiety, and more. Select as many as apply.',
      },
      {
        heading: 'Set your four scores',
        body: 'Use the sliders to rate Severity (how intense your symptoms feel overall), Mood, Energy, and Sleep — each on a scale from 1 to 10. Try to use the same mental benchmark every day so your trend data stays meaningful.',
      },
      {
        heading: 'Add optional notes',
        body: 'The notes field is a free-text area for anything else worth recording — dietary changes, stress events, medication, exercise, or general observations. These notes stay private and are only visible to you.',
      },
      {
        heading: 'Save your entry',
        body: 'Click Save Entry. Your log is saved immediately and your dashboard stats update. You can log up to 2 entries per day. Once you\'ve hit the limit the save button is disabled until the next day.',
      },
      {
        heading: 'Review and delete past logs',
        body: 'Your recent entries are listed below the logging form. Each card shows the date, selected symptoms, and scores. Click the delete icon on any entry to remove it permanently.',
      },
    ],
  },
  {
    id: 'insights',
    icon: TrendingUp,
    title: 'Reading Your Insights',
    intro: 'HarmoHelp surfaces patterns in your logged data to help you understand your health trends.',
    steps: [
      {
        heading: 'Symptom Insight Cards',
        body: 'The dashboard and symptom tracker display AI-powered insight cards that highlight recurring symptoms, notable score changes, and patterns across your logs. These appear after you have a few entries and become more accurate over time.',
      },
      {
        heading: 'Streak & consistency',
        body: 'Consistent daily logging is the most important thing you can do to get useful insights. A longer streak means more data points, which means better pattern detection. Even on good days with no symptoms, logging a quick entry is valuable.',
      },
      {
        heading: 'Interpreting score trends',
        body: 'If your severity line chart is trending upward, your symptoms are worsening over time. If mood and energy are trending down together, that may indicate hormonal shifts worth discussing with a health professional. Use the charts as a conversation starter, not a diagnosis.',
      },
    ],
  },
  {
    id: 'community',
    icon: Users,
    title: 'Community Hub',
    intro: 'A safe space to share experiences, ask questions, and connect with others on similar health journeys.',
    steps: [
      {
        heading: 'Browse the feed',
        body: 'The Community feed shows posts from all users sorted by most recent. You can filter by category — such as General Discussion, Symptoms, Nutrition, or Mental Health — to find posts relevant to you.',
      },
      {
        heading: 'Create a post',
        body: 'Click New Post, choose a category, write a title and your message body, then submit. Your post appears in the feed immediately. Keep posts respectful and on-topic.',
      },
      {
        heading: 'Like and comment',
        body: 'Click the heart icon to like any post. Open a post to read and leave comments. You can unlike by clicking the heart again. Comments cannot currently be deleted once posted, so review before submitting.',
      },
    ],
  },
  {
    id: 'consultations',
    icon: Calendar,
    title: 'Booking a Consultation',
    intro: 'Connect with a health expert for a personalised one-on-one session.',
    steps: [
      {
        heading: 'Choose a consultation type',
        body: 'HarmoHelp offers three formats — Video Call, Phone Call, and Chat. Choose whichever you\'re most comfortable with.',
      },
      {
        heading: 'Pick a date and time',
        body: 'Select from the available time slots. Slots that are already booked will appear greyed out. Choose a slot that gives you enough time to prepare any questions or data you want to discuss.',
      },
      {
        heading: 'Add notes for the expert',
        body: 'Use the notes field to share context with your expert before the session — recent symptoms, concerns, or questions. This helps them make the most of your time together.',
      },
      {
        heading: 'Confirm and track',
        body: 'Click Confirm Booking. Your upcoming appointments will be listed on the Consultations page with their status. You can check back here to see whether your booking has been confirmed.',
      },
    ],
  },
  {
    id: 'shop',
    icon: ShoppingBag,
    title: 'Shop',
    intro: 'Browse and purchase health and wellness products curated for hormonal health.',
    steps: [
      {
        heading: 'Browse products',
        body: 'The shop lists supplements, wellness products, and health tools. Each product card shows the price, description, and stock availability. Use the category filters to narrow down what you\'re looking for.',
      },
      {
        heading: 'Add to cart',
        body: 'Click Add to Cart on any product. You can adjust quantities in the cart before checkout. The cart icon in the shop header shows your current item count.',
      },
      {
        heading: 'Checkout',
        body: 'Click Checkout in your cart. You\'ll be redirected to the Razorpay payment gateway for secure payment. After a successful payment, your order is recorded and visible in the Order History section of your dashboard.',
      },
    ],
  },
  {
    id: 'profile',
    icon: UserCircle,
    title: 'Profile & Settings',
    intro: 'Manage your personal information, appearance, and account preferences.',
    steps: [
      {
        heading: 'Access Settings',
        body: 'Click your avatar in the top-right corner of the navigation bar (or tap your avatar on mobile) to open the Settings page.',
      },
      {
        heading: 'Update your profile picture',
        body: 'In the Profile Picture section, click Change photo and select an image file from your device (JPG, PNG, or WebP, max 5 MB). The photo uploads to Firebase Storage and your avatar updates across the entire app immediately.',
      },
      {
        heading: 'Edit your name and bio',
        body: 'In the Personal Info section, update your display name and add a short bio. Click Save changes to apply. Your display name is shown in the nav dropdown and on your dashboard welcome message.',
      },
      {
        heading: 'Log out',
        body: 'Scroll to the bottom of the Settings page and click Log out. You can also log out from the avatar dropdown in the nav bar. Either way, you\'ll be signed out and redirected to the home page.',
      },
    ],
  },
];

export default function GuidePage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(sections[0].id);

  const current = sections.find((s) => s.id === active);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
              <BookOpen size={22} className="text-[#D4B83A]" /> How to Use HarmoHelp
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">A step-by-step guide to every feature</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <aside className="sm:w-52 shrink-0">
            <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
              {sections.map(({ id, icon: Icon, title }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition text-left ${
                    active === id
                      ? 'bg-[#FFF3CC] text-navy'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  {title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {current && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <current.icon size={20} className="text-[#D4B83A] shrink-0" />
                  <h2 className="text-xl font-black text-navy">{current.title}</h2>
                </div>
                <p className="text-gray-500 text-sm mb-6">{current.intro}</p>

                <div className="flex flex-col gap-5">
                  {current.steps.map((step, i) => (
                    <div key={step.heading} className="flex gap-4">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-[#FFF3CC] border border-[#E8D88A] flex items-center justify-center text-xs font-bold text-navy mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy mb-1">{step.heading}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
