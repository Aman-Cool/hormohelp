import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Heart, Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [searchParams]  = useSearchParams();
  const { applyVerifiedSession } = useAuth();

  const emailFromState  = location.state?.email || '';
  const tokenFromUrl    = searchParams.get('token');

  const [status, setStatus]         = useState('idle'); // idle | verifying | success | error
  const [errorMsg, setErrorMsg]      = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
  const [resendError, setResendError]   = useState('');
  const [cooldown, setCooldown]      = useState(0);
  const cooldownRef                  = useRef(null);

  // Auto-verify when a token appears in the URL
  useEffect(() => {
    if (!tokenFromUrl) return;
    setStatus('verifying');

    api.post('/auth/verify-email', { token: tokenFromUrl })
      .then(({ data }) => {
        applyVerifiedSession(data.accessToken, data.user);
        setStatus('success');
        setTimeout(() => navigate('/onboarding', { replace: true }), 1800);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || 'Verification failed. The link may have expired.';
        setErrorMsg(msg);
        setStatus('error');
      });
  }, [tokenFromUrl]);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const handleResend = async () => {
    if (!emailFromState || cooldown > 0) return;
    setResendStatus('sending');
    setResendError('');
    try {
      await api.post('/auth/resend-verification', { email: emailFromState });
      setResendStatus('sent');
      startCooldown();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not resend. Please try again.';
      setResendError(msg);
      setResendStatus('error');
    }
  };

  // ── Verifying state (token in URL, waiting on API) ──────────────────────────
  if (status === 'verifying') {
    return (
      <Layout>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mb-5" />
          <p className="font-bold text-navy text-lg mb-1">Verifying your email…</p>
          <p className="text-gray-400 text-sm">Just a moment</p>
        </div>
      </Layout>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <Layout>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <p className="font-black text-navy text-2xl mb-2">Email verified!</p>
          <p className="text-gray-400 text-sm">Taking you to your account…</p>
        </div>
      </Layout>
    );
  }

  // ── Token error ──────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="font-black text-navy text-xl mb-2">Verification failed</p>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs">{errorMsg}</p>

          {emailFromState && (
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending' || cooldown > 0}
              className="flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed mb-3"
            >
              <RefreshCw size={14} className={resendStatus === 'sending' ? 'animate-spin' : ''} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : resendStatus === 'sending' ? 'Sending…' : 'Send a new link'}
            </button>
          )}

          {resendStatus === 'sent' && (
            <p className="text-green-600 text-xs">New link sent — check your inbox.</p>
          )}
          {resendError && <p className="text-red-500 text-xs">{resendError}</p>}

          <Link to="/signup" className="mt-4 text-sm text-gray-400 hover:text-navy">
            Back to sign up
          </Link>
        </div>
      </Layout>
    );
  }

  // ── Default: "check your inbox" ──────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF3CC] flex items-center justify-center mb-5">
          <Mail size={28} className="text-navy" />
        </div>

        <h1 className="text-2xl font-black text-navy mb-2">Check your inbox</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-1">
          We sent a verification link to
        </p>
        {emailFromState && (
          <p className="font-semibold text-navy text-sm mb-6">{emailFromState}</p>
        )}
        <p className="text-gray-400 text-xs mb-8 leading-relaxed max-w-xs">
          Click the link in the email to activate your account. The link expires in 24 hours.
          Check your spam folder if you don't see it.
        </p>

        {/* Resend section */}
        <div className="w-full border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-400 mb-3">Didn't receive it?</p>

          {resendStatus === 'sent' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle size={15} />
              New link sent — check your inbox
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={!emailFromState || resendStatus === 'sending' || cooldown > 0}
              className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-navy hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={resendStatus === 'sending' ? 'animate-spin' : ''} />
              {cooldown > 0
                ? `Resend available in ${cooldown}s`
                : resendStatus === 'sending'
                ? 'Sending…'
                : 'Resend verification email'}
            </button>
          )}

          {resendError && (
            <p className="text-red-500 text-xs mt-2 text-center">{resendError}</p>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Wrong email?{' '}
          <Link to="/signup" className="text-navy font-medium hover:underline">
            Sign up again
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFFBEF] flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
          <Heart size={18} fill="white" /> HarmoHelp
        </Link>
        <span className="text-gray-500 text-sm font-medium">Email Verification</span>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
