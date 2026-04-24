import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Sign-in is not enabled for this domain. Please contact support.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
          <Heart size={18} fill="white" /> HarmoHelp
        </Link>
        <span className="text-gray-500 text-sm font-medium">Hormone Education Platform</span>
      </header>

      <div className="flex flex-1">
        {/* Left: Form */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-8 py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-black text-navy mb-2 text-center">Welcome Back</h1>
            <p className="text-gray-500 text-center mb-8">Sign in to continue your hormonal wellness journey</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-center mb-1">Sign In to Your Account</h2>
              <p className="text-gray-400 text-sm text-center mb-6">Choose your preferred sign-in method</p>

              {!showEmailForm ? (
                <>
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFF3CC] text-navy border border-[#E8D88A] px-4 py-3 rounded-xl font-medium hover:bg-[#FFE88A] transition mb-4"
                  >
                    <Mail size={18} /> Sign In with Email
                  </button>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs">OR CONTINUE WITH</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="font-bold text-red-500">G</span> Continue with Google
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed" disabled>
                    <span className="font-bold">🍎</span> Continue with Apple
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 mt-3">{error}</p>
                  )}
                </>
              ) : (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                  {error && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-navy text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Signing in…' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEmailForm(false); setError(''); }}
                    className="text-sm text-gray-400 hover:text-navy text-center"
                  >
                    ← Back to sign-in options
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-gray-400">
                New to HarmoHelp?{' '}
                <Link to="/signup" className="text-navy font-semibold hover:underline">
                  Create Your Account →
                </Link>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <Shield size={12} className="mt-0.5 flex-shrink-0" />
                <span><strong>Secure Authentication:</strong> Your login is protected by enterprise-grade security. We never store your passwords and all data is encrypted.</span>
              </div>
            </div>

            <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-gray-500 text-sm hover:text-navy">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>

        {/* Right: Info */}
        <div className="hidden lg:flex flex-1 flex-col px-12 py-12 bg-gray-50">
          <div className="relative mb-8 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80"
              alt="Community"
              className="w-full h-64 object-cover rounded-2xl"
            />
            <div className="absolute bottom-4 right-4 bg-[#FFF3CC] rounded-xl px-4 py-2 font-bold text-navy shadow">
              5,000+ <br /><span className="font-normal text-sm">Active Members</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-navy mb-6">Why Join HarmoHelp?</h2>
          {[
            { icon: <Heart size={18} />, title: 'Track Your Health', desc: 'Monitor symptoms and patterns with our intuitive tracking tools' },
            { icon: <Users size={18} />, title: 'Join Community', desc: 'Connect with others on similar health journeys' },
            { icon: <Shield size={18} />, title: 'Expert Guidance', desc: 'Access evidence-based educational content and insights' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#FFF3CC] flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <div>
                <p className="font-semibold text-navy">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 italic text-sm mb-4">
              "HarmoHelp transformed how I understand my body. The tracking tools and community support gave me confidence to have better conversations with my healthcare provider."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center font-bold text-sm text-teal-800">SL</div>
              <div>
                <p className="font-semibold text-sm">Sarah L.</p>
                <p className="text-gray-400 text-xs">Community Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
          <Link to="/privacy" className="hover:text-navy">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-navy">Terms of Service</Link>
          <a href="mailto:support@harmohelp.com" className="hover:text-navy">Support</a>
        </div>
        <span className="text-center">© {new Date().getFullYear()} HarmoHelp. Empowering hormonal wellness.</span>
      </footer>
    </div>
  );
}
