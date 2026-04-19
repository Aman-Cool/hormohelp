import { Link, useLocation } from 'react-router-dom';
import { Heart, Activity, BookOpen, Users, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard',       icon: Heart,     label: 'HarmoHelp' },
  { to: '/symptom-tracker', icon: Activity,  label: 'Track Symptoms' },
  { to: '/education',       icon: BookOpen,  label: 'Learn' },
  { to: '/community',       icon: Users,     label: 'Community' },
  { to: '/consultations',   icon: Calendar,  label: 'Consultations' },
];

export default function DashboardNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const activeClass = (path) =>
    location.pathname === path
      ? 'bg-[#FFF3CC] text-navy font-semibold'
      : 'text-gray-600 hover:bg-gray-100';

  return (
    <>
      {/* Desktop nav — unchanged */}
      <nav className="hidden sm:flex items-center justify-center gap-2 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${activeClass(to)}`}>
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>

      {/* Mobile nav */}
      <nav className="sm:hidden sticky top-0 bg-white z-20 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-navy font-bold text-sm">
            <Heart size={16} className="text-[#D4B83A]" /> HarmoHelp
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
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
