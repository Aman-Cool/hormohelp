import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Info } from 'lucide-react';

const steps = ['Personal Info', 'Medical History', 'Health Goals', 'Privacy & Terms'];

export default function OnboardingPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    dob: '',
    phone: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-navy">Welcome to HarmoHelp!</h1>
          <span className="text-sm text-gray-400 border border-gray-200 rounded-full px-3 py-1">Step {step + 1} of {steps.length}</span>
        </div>
        <p className="text-gray-500 text-sm mb-6">Let's personalize your experience</p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-[#D4B83A] rounded-full transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-10">
          {steps.map((s, i) => (
            <span key={s} className={i <= step ? 'text-navy font-medium' : ''}>{s}</span>
          ))}
        </div>

        {step === 0 && (
          <div className="border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-gray-400" />
              <h2 className="font-bold text-lg">Personal Information</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">Help us get to know you better. This information helps us provide personalized insights.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth *</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Emergency Contact Name</label>
                <input
                  placeholder="Emergency contact name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.emergencyName}
                  onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Emergency Contact Phone</label>
                <input
                  placeholder="Emergency contact phone"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex gap-3 text-sm text-gray-500">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-700 mb-1">Why we collect this information:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Personalize your health insights and recommendations</li>
                  <li>Age-appropriate content and cycle predictions</li>
                  <li>Emergency contact for safety (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {step > 0 && (
          <div className="border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            <p className="text-lg font-medium">{steps[step]}</p>
            <p className="text-sm mt-2">This step will be available once you complete onboarding.</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : null}
            className="text-gray-400 text-sm hover:text-navy"
          >
            {step > 0 ? 'Back' : 'Skip for now'}
          </button>
          <button
            onClick={next}
            className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center gap-2"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
