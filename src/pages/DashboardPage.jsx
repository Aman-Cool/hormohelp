import DashboardNav from '../components/DashboardNav';
import SymptomInsightCard from '../components/SymptomInsightCard';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Award, Target, Bell, Activity, Calendar, Package, ShoppingBag, BookOpen } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { SkeletonStatCards, SkeletonCharts } from '../components/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/symptoms/stats').catch(() => null),
      api.get('/api/orders').catch(() => null),
      api.get('/api/symptoms?limit=7').catch(() => null),
    ]).then(([statsRes, ordersRes, logsRes]) => {
      if (statsRes) setStats(statsRes.data);
      if (ordersRes) setOrders(ordersRes.data);
      if (logsRes) setRecentLogs(logsRes.data.logs ?? []);
    }).finally(() => setLoadingStats(false));
  }, []);

  const lineData = stats?.lineData ?? [];
  const barData  = stats?.barData  ?? [];
  const isNewUser = !loadingStats && (!stats || stats.total === 0);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-black text-navy">Welcome back, {user?.name || 'there'}!</h1>
            <p className="text-gray-400 text-sm">Here's your hormonal health overview</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 border border-[#E8D88A] bg-[#FFFBEF] px-4 py-2 rounded-xl text-sm font-medium text-yellow-700">
              <Heart size={14} /> {stats ? `${stats.streak} day streak` : '0 day streak'}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600">
              <Bell size={14} /> Notifications
            </div>
          </div>
        </div>

        {/* Stats */}
        {loadingStats ? (
          <SkeletonStatCards />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Symptoms Tracked', value: stats ? String(stats.total) : '0', icon: <Heart size={20} className="text-gray-400" /> },
              { label: 'Current Streak', value: stats ? `${stats.streak} days` : '0 days', icon: <TrendingUp size={20} className="text-gray-400" /> },
              { label: 'Achievements', value: '0', icon: <Award size={20} className="text-gray-400" /> },
              { label: 'Health Score', value: stats ? `${stats.healthScore}%` : '85%', icon: <Target size={20} className="text-gray-400" /> },
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Left: Charts or empty state */}
          {loadingStats ? (
            <SkeletonCharts />
          ) : isNewUser ? (
            <div className="sm:col-span-2 flex flex-col gap-6">
              <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-[#FFFBEF]">
                <div className="text-5xl mb-4">🌸</div>
                <h2 className="text-xl font-black text-navy mb-2">Welcome to HarmoHelp!</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                  Your dashboard will come alive once you start tracking. Log your first symptoms to see trends, charts, and personalized insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/symptom-tracker"
                    className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    <Activity size={16} /> Track Your First Symptoms
                  </Link>
                  <Link
                    to="/education"
                    className="inline-flex items-center justify-center gap-2 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <BookOpen size={16} /> Learn About Hormones
                  </Link>
                  <Link
                    to="/community"
                    className="inline-flex items-center justify-center gap-2 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Join the Community
                  </Link>
                </div>
              </div>

              {/* Shop banner always visible */}
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
          ) : (
            <div className="sm:col-span-2 flex flex-col gap-6">
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-navy">Symptom Severity Trends</h3>
                </div>
                {lineData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-12">Log symptoms to see your trend chart.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#1a1a2e" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-navy">Weekly Activity</h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData.length ? barData : [{ day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 }, { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 }, { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 }]}>
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
          )}

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Today's Goals</h3>
              </div>
              {[
                { label: 'Track symptoms', done: stats && stats.total > 0 ? 1 : 0, total: 1 },
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

            <SymptomInsightCard logs={recentLogs} />

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

            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Order History</h3>
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders yet. Visit the shop to get started!</p>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-navy">₹{parseFloat(order.total).toFixed(2)}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">paid</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

