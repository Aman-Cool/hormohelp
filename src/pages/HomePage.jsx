import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, BookOpen, Users, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  {
    id: 'track',
    icon: <Heart size={18} />,
    label: 'Track & Understand',
    title: 'Your personal health dashboard.',
    desc: 'Log symptoms, track cycles, and visualize your hormonal patterns over time. Our smart tracker helps you connect the dots, offering personalized insights to understand your body better.',
    cta: 'Start Tracking',
    link: '/symptom-tracker',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
  },
  {
    id: 'learn',
    icon: <BookOpen size={18} />,
    label: 'Learn & Empower',
    title: 'Evidence-based education at your fingertips.',
    desc: 'Explore our library of articles, videos, and infographics created by hormone health experts. Knowledge is the first step to taking control of your wellness.',
    cta: 'Explore Content',
    link: '/education',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
  },
  {
    id: 'connect',
    icon: <Users size={18} />,
    label: 'Connect & Share',
    title: 'A community that understands you.',
    desc: 'Join thousands of people on similar journeys. Share experiences, ask questions, and find the support you need in a safe, moderated environment.',
    cta: 'Join Community',
    link: '/community',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('track');
  const tab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/90 backdrop-blur z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
            <Heart size={18} fill="white" /> HarmoHelp
          </div>
          <span className="text-sm text-gray-500 border border-gray-200 rounded-full px-3 py-1">Hormone Education</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/education" className="text-gray-700 hover:text-navy font-medium">Education</Link>
          <Link to="/shop" className="text-gray-700 hover:text-navy font-medium">Shop</Link>
          <Link to="/community" className="text-gray-700 hover:text-navy font-medium">Community</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="bg-navy text-white px-5 py-2 rounded-full font-medium flex items-center gap-2">
              Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 font-medium hover:text-navy">Sign In</Link>
              <Link to="/signup" className="bg-navy text-white px-5 py-2 rounded-full font-medium flex items-center gap-2">
                Start Your Journey <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#FFFBEF] to-[#E8F4F8] min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-6xl md:text-7xl font-black text-navy max-w-3xl leading-tight mb-6">
          Your Journey to Hormonal Wellness Starts Here
        </h1>
        <p className="text-xl text-gray-600 max-w-xl mb-2">
          Comprehensive education, personalized guidance, and community support for every stage of your health journey.
        </p>
      </section>

      {/* Tag line bar */}
      <div className="bg-gradient-to-b from-[#E8F4F8] to-white flex items-center justify-between px-8 py-5">
        <p className="text-gray-700 max-w-xs text-sm font-medium">
          Evidence-based hormone education and personalized health tracking for informed decisions.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-700 font-medium hover:text-navy">Sign In</Link>
          <Link to="/signup" className="bg-navy text-white px-5 py-2 rounded-full font-medium flex items-center gap-2">
            Start Your Journey <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* How it works */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-black text-navy mb-3">A Clear Path to Wellness</h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-14">
          Understanding your hormonal health is simpler than you think. Follow three straightforward steps to take control.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { n: '01', title: 'Track Your Symptoms', desc: 'Use our intuitive tools to log daily symptoms and life events. Consistency is key to uncovering patterns.' },
            { n: '02', title: 'Get Personalized Insights', desc: 'Our platform analyzes your data to provide evidence-based insights and potential connections you might have missed.' },
            { n: '03', title: 'Improve & Thrive', desc: 'Leverage your newfound knowledge, explore educational content, and connect with specialists to build a healthier life.' },
          ].map((s) => (
            <div key={s.n} className="bg-[#FFFBEF] rounded-2xl p-8 text-left relative overflow-hidden">
              <span className="text-7xl font-black text-gray-200 absolute top-2 left-4 select-none">{s.n}</span>
              <h3 className="font-bold text-xl text-navy mt-10 mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All in one toolkit */}
      <section className="py-20 px-6 bg-[#FFFBEF]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-navy mb-2">An All-in-One Health Toolkit</h2>
          <p className="text-gray-500 mb-12 max-w-lg">
            From symptom tracking to expert knowledge and peer support, Harmo Help integrates everything you need into one seamless platform.
          </p>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-3 md:w-64">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${
                    activeTab === t.id ? 'bg-white shadow-md font-semibold text-navy' : 'text-gray-500 hover:bg-white/60'
                  }`}
                >
                  <span className={`p-2 rounded-full ${activeTab === t.id ? 'bg-[#FFFBEF]' : ''}`}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 bg-transparent md:flex md:items-start gap-10">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-navy mb-4">{tab.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{tab.desc}</p>
                <Link to={tab.link} className="inline-flex items-center gap-2 border border-gray-300 px-5 py-2 rounded-full text-navy hover:bg-white transition">
                  {tab.cta} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="md:w-64 mt-8 md:mt-0">
                <img src={tab.img} alt={tab.label} className="rounded-2xl w-full h-48 object-cover shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visualize progress */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-black text-navy mb-3">Visualize Your Progress</h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-10">
          Our dashboard transforms your data into beautiful, easy-to-read charts. See your journey unfold and celebrate your milestones.
        </p>
        <div className="max-w-4xl mx-auto border-4 border-blue-100 rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
            alt="Dashboard preview"
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Community */}
      <section className="py-20 px-6 bg-[#FFFBEF]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-navy mb-4">Join a Thriving Community</h2>
            <p className="text-gray-500 leading-relaxed mb-8 max-w-sm">
              Share your story, find encouragement, and learn from the experiences of thousands of others on a similar path. Our community is a place for genuine connection and support.
            </p>
            <div className="flex items-center gap-1 mb-6">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white overflow-hidden -ml-1 first:ml-0">
                  <img src={`https://i.pravatar.cc/40?img=${i+10}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <span className="ml-2 bg-yellow-200 text-yellow-800 text-sm font-bold px-2 py-1 rounded-full">+5k</span>
            </div>
            <Link to="/community" className="inline-flex items-center gap-2 border border-gray-400 px-5 py-2 rounded-full text-navy hover:bg-white transition">
              Explore Community Forums <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {[
              { quote: '"For the first time, I feel like I actually understand my body. Seeing the patterns in the tracker was a game-changer for my conversations with my doctor."', author: '- Alexandra V.' },
              { quote: '"The community forums are amazing. It\'s so comforting to know you\'re not the only one going through this."', author: '- Priya S.' },
            ].map((t) => (
              <div key={t.author} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-700 italic mb-3">{t.quote}</p>
                <p className="font-semibold text-navy">{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#FFFBEF] to-[#E8F4F8] text-center">
        <h2 className="text-5xl font-black text-navy mb-4">Ready to Take Control of Your Hormonal Health?</h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8 font-medium">
          Join thousands of users who are already on their journey to better hormonal wellness. It's free to get started.
        </p>
        <Link to="/signup" className="inline-flex items-center gap-2 bg-navy text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition">
          Get Started Today <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-8 flex items-center justify-between text-sm text-gray-500">
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-navy">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-navy">Terms of Service</Link>
          <a href="mailto:support@harmohelp.com" className="hover:text-navy">Support</a>
        </div>
        <span>© {new Date().getFullYear()} HarmoHelp. Empowering hormonal wellness.</span>
      </footer>
    </div>
  );
}
