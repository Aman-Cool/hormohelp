import DashboardNav from '../components/DashboardNav';
import { useAuth } from '../context/AuthContext';
import { Heart, TrendingUp, Award, Target, Bell, Activity, Calendar, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const lineData = [
  { date: '2024-01-01', value: 3 },
  { date: '2024-01-02', value: 2 },
  { date: '2024-01-03', value: 4 },
  { date: '2024-01-04', value: 2 },
  { date: '2024-01-05', value: 1 },
  { date: '2024-01-06', value: 3 },
  { date: '2024-01-07', value: 2 },
];

const barData = [
  { day: 'Mon', value: 3 },
  { day: 'Tue', value: 5 },
  { day: 'Wed', value: 2 },
  { day: 'Thu', value: 4 },
  { day: 'Fri', value: 6 },
  { day: 'Sat', value: 3 },
  { day: 'Sun', value: 4 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-navy">Welcome back, {user?.name || 'Aman Kumar'}!</h1>
            <p className="text-gray-400 text-sm">Here's your hormonal health overview</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 border border-[#E8D88A] bg-[#FFFBEF] px-4 py-2 rounded-xl text-sm font-medium text-yellow-700">
              <Heart size={14} /> 0 day streak
            </div>
            <div className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600">
              <Bell size={14} /> Notifications
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Symptoms Tracked', value: '0', icon: <Heart size={20} className="text-gray-400" /> },
            { label: 'Current Streak', value: '0 days', icon: <TrendingUp size={20} className="text-gray-400" /> },
            { label: 'Achievements', value: '0', icon: <Award size={20} className="text-gray-400" /> },
            { label: 'Health Score', value: '85%', icon: <Target size={20} className="text-gray-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-200 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-navy">{stat.value}</p>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Charts */}
          <div className="col-span-2 flex flex-col gap-6">
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Symptom Severity Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1a1a2e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Weekly Activity</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#B8D8E8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Shop */}
            <div className="bg-green-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} />
                <h3 className="font-semibold">Health & Wellness Shop</h3>
              </div>
              <p className="text-green-200 text-sm mb-4">Discover quality products for your hormonal health journey</p>
              <Link to="/shop" className="w-full bg-green-600 hover:bg-green-500 rounded-xl py-3 flex items-center justify-center gap-3 font-semibold transition">
                <Package size={18} />
                <div>
                  <p>Shop Now</p>
                  <p className="text-xs font-normal text-green-200">Test kits, supplements & wellness products</p>
                </div>
              </Link>
              <div className="flex gap-4 mt-4 text-center text-sm">
                {['Test Kits', 'Supplements', 'Wellness'].map((c) => (
                  <div key={c} className="flex-1">
                    <p className="font-medium">{c}</p>
                    <p className="text-green-300 text-xs">{c === 'Test Kits' ? 'Hormone testing' : c === 'Supplements' ? 'Natural support' : 'Self-care items'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Today's Goals</h3>
              </div>
              {[
                { label: 'Track symptoms', done: 1, total: 1 },
                { label: 'Read article', done: 0, total: 1 },
                { label: 'Community interaction', done: 0, total: 1 },
              ].map((g) => (
                <div key={g.label} className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{g.label}</span>
                    <span>{g.done}/{g.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-[#D4B83A] rounded-full" style={{ width: `${(g.done / g.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Recent Achievements</h3>
              </div>
              <p className="text-gray-400 text-sm">No achievements yet. Start tracking to earn your first badge!</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2"><span>💡</span> Today's Health Tip</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <strong>Did you know?</strong> Regular sleep patterns can significantly impact hormone regulation. Try to maintain consistent sleep and wake times to support your hormonal health.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Upcoming</h3>
              </div>
              {[
                { label: 'Symptom check reminder', time: 'Today, 8:00 PM' },
                { label: 'Weekly health review', time: 'Sunday, 10:00 AM' },
              ].map((e) => (
                <div key={e.label} className="flex items-start gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{e.label}</p>
                    <p className="text-xs text-gray-400">{e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
