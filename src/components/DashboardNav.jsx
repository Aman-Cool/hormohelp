import { Link, useLocation } from 'react-router-dom';
import { Heart, Activity, BookOpen, Users, Calendar } from 'lucide-react';

export default function DashboardNav() {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path
      ? 'bg-[#FFF3CC] text-navy font-semibold'
      : 'text-gray-600 hover:bg-gray-100';

  return (
    <nav className="flex items-center justify-center gap-2 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
      <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active('/dashboard')}`}>
        <Heart size={16} /> HarmoHelp
      </Link>
      <Link to="/symptom-tracker" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active('/symptom-tracker')}`}>
        <Activity size={16} /> Track Symptoms
      </Link>
      <Link to="/education" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active('/education')}`}>
        <BookOpen size={16} /> Learn
      </Link>
      <Link to="/community" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active('/community')}`}>
        <Users size={16} /> Community
      </Link>
      <Link to="/consultations" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active('/consultations')}`}>
        <Calendar size={16} /> Consultations
      </Link>
    </nav>
  );
}
