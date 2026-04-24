import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Camera, LogOut, Save, ArrowLeft } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import DashboardNav from '../components/DashboardNav';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase';

export default function SettingsPage() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile({ avatar_url: url });
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({ name: name.trim(), bio: bio.trim() });
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-navy">Settings</h1>
            <p className="text-gray-400 text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Picture */}
        <section className="border border-gray-200 rounded-2xl p-6 mb-5">
          <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
            <Camera size={16} /> Profile Picture
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Camera size={14} /> {avatarUploading ? 'Uploading…' : 'Change photo'}
              </button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP · Max 5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </section>

        {/* Personal Info */}
        <section className="border border-gray-200 rounded-2xl p-6 mb-5">
          <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
            <User size={16} /> Personal Info
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-[#D4B83A] focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-[#D4B83A] focus:border-transparent resize-none"
                placeholder="A short bio about yourself…"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="border border-gray-200 rounded-2xl p-6 mb-5">
          <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
            <Mail size={16} /> Account
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Email address
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="border border-red-100 rounded-2xl p-6">
          <h2 className="text-base font-bold text-navy mb-1">Log out</h2>
          <p className="text-sm text-gray-400 mb-4">
            You will be signed out and redirected to the home page.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition border border-red-200"
          >
            <LogOut size={14} /> Log out
          </button>
        </section>
      </div>
    </div>
  );
}
