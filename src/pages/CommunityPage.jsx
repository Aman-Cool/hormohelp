import DashboardNav from '../components/DashboardNav';
import { Search, Plus, Heart, MessageCircle, Share2, Flag, TrendingUp, Award, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { SkeletonPostCards } from '../components/Skeleton';

const popularCategories = ['General Discussion', 'Menstrual Health', 'Hormones', 'Nutrition', 'Exercise & Fitness', 'Mental Health'];

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('General Discussion');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const fetchPosts = async () => {
    try {
      const params = {};
      if (category !== 'All Categories') params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/api/posts', { params });
      setPosts(data);
    } catch (_) {
      // keep existing posts on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchPosts();
  };

  const toggleLike = async (id) => {
    try {
      const { data } = await api.post(`/api/posts/${id}/like`);
      setPosts((prev) => prev.map((p) =>
        p.id === id ? { ...p, liked: data.liked, like_count: data.like_count } : p,
      ));
    } catch (_) {}
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setPostError('');
    setIsPosting(true);
    try {
      const { data } = await api.post('/api/posts', {
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
      });
      setPosts((prev) => [data, ...prev]);
      setShowNew(false);
      setNewTitle('');
      setNewBody('');
      setNewCategory('General Discussion');
      toast.success('Post published!');
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg = apiErrors ? apiErrors.map((e) => e.msg).join(' ') : 'Failed to post. Try again.';
      setPostError(msg);
      toast.error(msg);
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const categoryCounts = popularCategories.reduce((acc, c) => {
    acc[c] = posts.filter((p) => p.category === c).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy">Community Hub</h1>
            <p className="text-gray-400 text-sm">Connect, share experiences, and support each other on your health journey</p>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="text-sm outline-none w-32 sm:w-40"
              />
            </form>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 bg-[#FFF3CC] text-navy border border-[#E8D88A] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#FFE88A] transition"
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="sm:col-span-2 flex flex-col gap-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option>All Categories</option>
                {popularCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                <option>Most Recent</option>
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
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-navy mb-3"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none mb-3"
                >
                  {popularCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share your experience or ask a question..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-navy resize-none"
                  rows={4}
                />
                {postError && (
                  <p className="text-red-500 text-sm mt-2">{postError}</p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handlePost}
                    disabled={isPosting || !newTitle.trim() || !newBody.trim()}
                    className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPosting ? 'Posting…' : 'Post'}
                  </button>
                  <button onClick={() => { setShowNew(false); setPostError(''); }} className="border border-gray-200 px-4 py-2 rounded-xl text-sm">Cancel</button>
                </div>
              </div>
            )}

            {loading ? (
              <SkeletonPostCards count={3} />
            ) : posts.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-[#FFFBEF]">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-black text-navy mb-1">No posts yet</h3>
                <p className="text-gray-400 text-sm mb-5">Be the first to start a discussion and help others in the community.</p>
                <button
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                >
                  <Plus size={15} /> Start a Discussion
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{post.category}</span>
                      <span className="text-sm text-gray-400">by <strong className="text-gray-600">{post.author_name}</strong> · {formatDate(post.created_at)}</span>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500">•••</button>
                  </div>
                  <h3 className="font-bold text-navy mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{post.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm ${post.liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-400 transition`}
                      >
                        <Heart size={15} fill={post.liked ? 'currentColor' : 'none'} />
                        {post.like_count}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition">
                        <MessageCircle size={15} /> {post.comment_count}
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
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Community Stats</h3>
              </div>
              {[
                { label: 'Total Posts', value: posts.length },
                { label: 'Total Comments', value: posts.reduce((s, p) => s + p.comment_count, 0) },
                { label: 'Active Members', value: '—' },
                { label: 'This Week', value: posts.filter((p) => {
                  const d = new Date(p.created_at);
                  const now = new Date();
                  return (now - d) < 7 * 24 * 60 * 60 * 1000;
                }).length },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{s.label}</span>
                  <span className="text-sm font-bold text-[#D4B83A]">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-4">Popular Categories</h3>
              <div className="flex flex-col gap-2">
                {popularCategories.map((c) => (
                  <div key={c} className="flex justify-between items-center">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{c}</span>
                    <span className="text-xs text-gray-400">{categoryCounts[c] || 0}</span>
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
