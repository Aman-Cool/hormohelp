import { Link, useNavigate } from 'react-router-dom';

import { Heart, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signup(form.name, form.email, form.password);
      if (result?.requiresVerification) {
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg = apiErrors
        ? apiErrors.map((e) => e.msg).join(' ')
        : err?.response?.data?.error || 'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
          <Heart size={18} fill="white" /> HarmoHelp
        </Link>
        <span className="text-gray-500 text-sm font-medium">Hormone Education Platform</span>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-black text-navy mb-2 text-center">Create Account</h1>
          <p className="text-gray-500 text-center mb-8">Start your hormonal wellness journey today</p>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <input
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By signing up you agree to our{' '}
                <Link to="/terms" className="text-navy hover:underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-navy hover:underline font-medium">Privacy Policy</Link>.
              </p>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-navy font-semibold hover:underline">Sign In</Link>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
              <Shield size={12} className="mt-0.5 flex-shrink-0" />
              <span><strong>Secure Registration:</strong> Your data is encrypted and never shared with third parties.</span>
            </div>
          </div>

          <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-gray-500 text-sm hover:text-navy">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
