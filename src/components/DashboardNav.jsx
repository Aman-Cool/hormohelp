import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Activity, BookOpen, Users, Calendar, Menu, X, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import AIChatWidget from './AIChatWidget';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',       icon: Heart,     label: 'HarmoHelp' },
  { to: '/symptom-tracker', icon: Activity,  label: 'Track Symptoms' },
  { to: '/education',       icon: BookOpen,  label: 'Learn' },
  { to: '/community',       icon: Users,     label: 'Community' },
  { to: '/consultations',   icon: Calendar,  label: 'Consultations' },
];

function Avatar({ user, className = 'w-8 h-8' }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user?.name}
        className={`${className} rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${className} rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold`}>
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export default function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeClass = (path) =>
    location.pathname === path
      ? 'bg-[#FFF3CC] text-navy font-semibold'
      : 'text-gray-600 hover:bg-gray-100';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <AIChatWidget />

      {/* Desktop nav */}
      <nav className="hidden sm:flex relative items-center justify-center gap-2 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${activeClass(to)}`}>
            <Icon size={16} /> {label}
          </Link>
        ))}

        <div className="absolute right-4" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center rounded-full hover:opacity-80 transition focus:outline-none"
            aria-label="Profile menu"
          >
            <Avatar user={user} className="w-9 h-9" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-navy truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Settings size={14} /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="sm:hidden sticky top-0 bg-white z-20 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-navy font-bold text-sm">
            <Heart size={16} className="text-[#D4B83A]" /> HarmoHelp
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/settings" aria-label="Settings">
              <Avatar user={user} className="w-8 h-8" />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-gray-100 px-4 pb-4 flex flex-col gap-1 bg-white">
            {navItems.slice(1).map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeClass(to)}`}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
