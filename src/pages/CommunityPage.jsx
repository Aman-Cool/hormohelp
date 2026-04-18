import DashboardNav from '../components/DashboardNav';
import { Search, Plus, Heart, MessageCircle, Share2, Flag, TrendingUp, Award, Clock } from 'lucide-react';
import { useState } from 'react';

const posts = [
  {
    id: 1, category: 'General Discussion', author: 'CycleSavvy', date: 'Jul 16, 2024',
    title: 'Best Apps for Period Tracking and Symptom Logging',
    content: "Looking for recommendations for reliable period tracking apps that also allow detailed symptom logging. I want to better understand my cycle and identify patterns. What do you use?",
    likes: 60, comments: 15,
  },
  {
    id: 2, category: 'General Discussion', author: 'AlphaHealth', date: 'Jul 15, 2024',
    title: 'Male Hormones: Testosterone and Energy Levels',
    content: "Guys, let's talk about testosterone. I've noticed a dip in energy and libido. Has anyone explored natural ways to boost testosterone or considered TRT? Share your experiences.",
    likes: 45, comments: 10,
  },
  {
    id: 3, category: 'General Discussion', author: 'ConcernedParent', date: 'Jul 14, 2024',
    title: 'Navigating Puberty with My Teen Daughter',
    content: "My daughter is starting puberty and it's a rollercoaster! Any parents out there with advice on how to support her through mood swings, skin changes, and body image issues? Resources welcome!",
    likes: 55, comments: 12,
  },
  {
    id: 4, category: 'General Discussion', author: 'StressLess', date: 'Jul 13, 2024',
    title: 'Dietary Changes for Adrenal Fatigue',
    content: 'I suspect I have adrenal fatigue due to chronic stress. What kind of dietary changes have you found most helpful for supporting adrenal health? Supplements?',
    likes: 38, comments: 9,
  },
];

const popularCategories = ['General Discussion', 'Menstrual Health', 'Hormones', 'Nutrition', 'Exercise & Fitness', 'Mental Health'];

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState('');

  const toggleLike = (id) => setLiked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy">Community Hub</h1>
            <p className="text-gray-400 text-sm">Connect, share experiences, and support each other on your health journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="text-sm outline-none w-40"
              />
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 bg-[#FFF3CC] text-navy border border-[#E8D88A] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#FFE88A] transition"
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Posts */}
          <div className="col-span-2 flex flex-col gap-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                <option>All Categories</option>
                {popularCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                <option>Most Recent</option>
                <option>Most Popular</option>
              </select>
            </div>

            {/* Guidelines */}
            <div className="border border-gray-200 rounded-2xl p-4 flex items-start gap-3 bg-gray-50">
              <div className="text-gray-400 mt-0.5">👥</div>
              <div>
                <h3 className="font-semibold text-navy text-sm">Community Guidelines</h3>
                <p className="text-gray-400 text-sm">Be respectful, supportive, and kind. Share experiences to help others. No medical advice - always consult healthcare professionals.</p>
              </div>
            </div>

            {/* New Post Form */}
            {showNew && (
              <div className="border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-navy mb-3">Create a New Post</h3>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your experience or ask a question..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-navy resize-none"
                  rows={4}
                />
                <div className="flex gap-3 mt-3">
                  <button className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-medium">Post</button>
                  <button onClick={() => setShowNew(false)} className="border border-gray-200 px-4 py-2 rounded-xl text-sm">Cancel</button>
                </div>
              </div>
            )}

            {posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())).map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{post.category}</span>
                    <span className="text-sm text-gray-400">by <strong className="text-gray-600">{post.author}</strong> • {post.date}</span>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500">•••</button>
                </div>
                <h3 className="font-bold text-navy mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm ${liked.includes(post.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-400 transition`}
                    >
                      <Heart size={15} fill={liked.includes(post.id) ? 'currentColor' : 'none'} />
                      {post.likes + (liked.includes(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition">
                      <MessageCircle size={15} /> {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition">
                      <Share2 size={15} /> Share
                    </button>
                  </div>
                  <button className="text-gray-300 hover:text-red-400">
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Community Stats</h3>
              </div>
              {['Total Posts', 'Total Comments', 'Active Members', 'This Week'].map((s) => (
                <div key={s} className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{s}</span>
                  <span className="text-sm font-bold text-[#D4B83A]">—</span>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-4">Popular Categories</h3>
              <div className="flex flex-col gap-2">
                {popularCategories.map((c) => (
                  <div key={c} className="flex justify-between items-center">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{c}</span>
                    <span className="text-xs text-gray-400">0</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Your Achievements</h3>
              </div>
              <p className="text-sm text-gray-400">Start participating to earn achievements!</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Recent Activity</h3>
              </div>
              {[
                { dot: 'bg-yellow-400', text: 'New post in Menstrual Health' },
                { dot: 'bg-blue-400', text: '5 new comments on popular posts' },
                { dot: 'bg-green-400', text: 'Weekly discussion: Nutrition tips' },
              ].map((a) => (
                <div key={a.text} className="flex items-start gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${a.dot} mt-1.5 flex-shrink-0`} />
                  <p className="text-sm text-gray-500">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
