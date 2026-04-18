import DashboardNav from '../components/DashboardNav';
import { Search, Star, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const categories = ['All', 'Puberty', 'Menstrual Health', 'Hormones', 'Nutrition', 'Exercise', 'Mental Health', 'Reproductive Health', 'Menopause', 'PCOS'];
const contentTypes = ['All Content', 'Videos', 'Articles', 'Infographics', 'Downloads', 'Quizzes'];

const content = [
  {
    id: 1, title: 'Understanding Your Menstrual Cycle', type: 'Video', time: '15m', level: 'beginner',
    rating: 4.8, views: 1250, tags: ['cycle', 'periods', 'hormones'], action: 'Watch Now',
    img: 'https://images.unsplash.com/photo-1506784926709-22f1ec395907?w=600&q=80',
    desc: 'A comprehensive guide to understanding the phases of your menstrual cycle and what happens in your body.',
  },
  {
    id: 2, title: 'Hormone Balance and Nutrition', type: 'Article', time: '10m', level: 'intermediate',
    rating: 4.6, views: 890, tags: ['nutrition', 'diet', 'hormones'], action: 'Read Now',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    desc: 'Learn how your diet affects hormone production and balance, with practical tips for optimal nutrition.',
  },
  {
    id: 3, title: 'PCOS: Symptoms and Management', type: 'Video', time: '20m', level: 'intermediate',
    rating: 4.9, views: 2100, tags: ['PCOS', 'symptoms', 'treatment'], action: 'Watch Now',
    img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
    desc: 'Understanding Polycystic Ovary Syndrome, its symptoms, and evidence-based management strategies.',
  },
  {
    id: 4, title: 'Puberty: What to Expect', type: 'Infographic', time: '5m', level: 'beginner',
    rating: 4.7, views: 1560, tags: ['puberty', 'teens', 'development'], action: 'Read Now',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    desc: 'A guide for teens and parents about the physical and emotional changes during puberty.',
  },
  {
    id: 5, title: 'Hormone Health Checklist', type: 'PDF', time: '3m', level: 'beginner',
    rating: 4.5, views: 750, tags: ['checklist', 'lifestyle', 'health'], action: 'Download',
    img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
    desc: 'Downloadable PDF checklist for maintaining optimal hormone health through lifestyle choices.',
  },
];

const levelColors = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-red-100 text-red-700' };

export default function EducationPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All Content');

  const filtered = content.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (activeType === 'All Content' || c.type === activeType.replace('s', ''))
  );

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy">Educational Hub</h1>
            <p className="text-gray-400 text-sm">Learn about hormonal health through videos, articles, and interactive content</p>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-56">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="text-sm outline-none flex-1"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                activeCategory === c ? 'bg-[#FFF3CC] text-navy font-semibold border border-[#E8D88A]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Content type tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {contentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeType === t ? 'border-navy text-navy bg-[#FFF3CC]' : 'border-transparent text-gray-500 hover:text-navy'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {filtered.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition">
              <div className="relative">
                <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded ${levelColors[item.level]}`}>
                  {item.level}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span className="border border-gray-200 rounded px-2 py-0.5">{item.type}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {item.time}</span>
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.desc}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} fill="#F59E0B" className="text-yellow-400" />
                  <span className="text-xs font-semibold">{item.rating}</span>
                  <span className="text-xs text-gray-400">({item.views.toLocaleString()} views)</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <button className="w-full border border-blue-200 bg-blue-50 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition">
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Progress */}
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-500" />
            <h3 className="font-semibold text-navy">Your Learning Progress</h3>
          </div>
          <div className="grid grid-cols-3 gap-8 text-center mb-4">
            {[{ v: '0', l: 'Completed' }, { v: '0%', l: 'Progress' }, { v: '0', l: 'Total Points' }].map((s) => (
              <div key={s.l}>
                <p className="text-3xl font-black text-navy">{s.v}</p>
                <p className="text-sm text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Overall Progress</span>
            <span>0%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full mt-2">
            <div className="h-2 bg-[#D4B83A] rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
