import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../firebase';

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const emailFromState = location.state?.email || auth.currentUser?.email || '';

  const [resendStatus, setResendStatus] = useState('idle');
  const [resendError, setResendError]   = useState('');
  const [cooldown, setCooldown]         = useState(0);
  const cooldownRef = useRef(null);

  // Poll Firebase to detect when the user clicks the verification link
  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    if (auth.currentUser.emailVerified) {
      navigate('/onboarding', { replace: true });
      return;
    }

    const interval = setInterval(async () => {
      try {
        await reload(auth.currentUser);
        if (auth.currentUser?.emailVerified) {
          clearInterval(interval);
          navigate('/onboarding', { replace: true });
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

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
    if (!auth.currentUser || cooldown > 0) return;
    setResendStatus('sending');
    setResendError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setResendStatus('sent');
      startCooldown();
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/too-many-requests') {
        setResendError('Too many requests. Please wait a moment.');
      } else {
        setResendError('Could not resend. Please try again.');
      }
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full font-bold text-lg">
          <Heart size={18} fill="white" /> HarmoHelp
        </Link>
        <span className="text-gray-500 text-sm font-medium">Email Verification</span>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
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
              Click the link in the email to activate your account. This page will
              automatically continue once your email is verified.
            </p>

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
                  disabled={!auth.currentUser || resendStatus === 'sending' || cooldown > 0}
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
        </div>
      </div>
    </div>
  );
}
