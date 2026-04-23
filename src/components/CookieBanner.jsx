import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no decision has been stored yet
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFF3CC] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie size={16} className="text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy text-sm mb-1">We use cookies</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              HarmoHelp uses a single session cookie to keep you signed in securely. We do not use
              advertising or tracking cookies. By clicking Accept you agree to our use of cookies as
              described in our{' '}
              <Link to="/privacy" className="text-navy underline hover:opacity-80">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4 sm:justify-end">
          <button
            onClick={decline}
            className="text-sm text-gray-500 hover:text-navy px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-navy text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
