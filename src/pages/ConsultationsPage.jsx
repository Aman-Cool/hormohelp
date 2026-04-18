import DashboardNav from '../components/DashboardNav';
import { useState } from 'react';
import { Video, Phone, MessageSquare, Calendar, Shield, ChevronRight } from 'lucide-react';

const consultationTypes = [
  { id: 'video', icon: <Video size={24} />, title: 'Video Call', desc: 'Face-to-face consultation via secure video call', price: 150, duration: '45min' },
  { id: 'phone', icon: <Phone size={24} />, title: 'Phone Call', desc: 'Traditional phone consultation', price: 100, duration: '45min' },
  { id: 'chat', icon: <MessageSquare size={24} />, title: 'Text Chat', desc: 'Written consultation via secure messaging', price: 75, duration: '45min' },
];

const mockConsultations = [
  { date: 'Oct 25 at 11:00', type: 'video', duration: '45min', topic: 'General', doctor: 'Dr. Sarah Johnson', status: 'pending' },
  { date: 'Oct 25 at 11:00', type: 'video', duration: '45min', topic: 'General', doctor: 'Dr. Sarah Johnson', status: 'pending' },
  { date: 'Oct 25 at 11:00', type: 'video', duration: '45min', topic: 'General', doctor: 'Dr. Sarah Johnson', status: 'pending' },
  { date: 'Oct 25 at 11:00', type: 'video', duration: '45min', topic: 'General', doctor: 'Dr. Sarah Johnson', status: 'pending' },
];

const steps = ['Type', 'Expert', 'Schedule', 'Details', 'Confirm'];

export default function ConsultationsPage() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-navy mb-1">Book a Consultation</h1>
        <p className="text-gray-400 text-sm mb-8">Connect with hormone health experts for personalized guidance</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === step ? 'bg-[#D4B83A] text-navy' : i < step ? 'bg-navy text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-navy font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {step === 0 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Choose Consultation Type</h2>
                <div className="grid grid-cols-3 gap-4">
                  {consultationTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`border-2 rounded-2xl p-5 text-center transition flex flex-col items-center gap-3 ${
                        selectedType === t.id ? 'border-navy bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-gray-600">{t.icon}</div>
                      <p className="font-bold text-navy">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                      <div className="h-1.5 bg-[#FFF3CC] rounded-full w-full" />
                      <p className="font-black text-xl text-navy">${t.price}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => selectedType && setStep(1)}
                    className={`px-8 py-3 rounded-xl font-semibold transition ${
                      selectedType ? 'bg-navy text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step > 0 && (
              <div className="border border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-lg">{steps[step]} step would appear here.</p>
                <p className="text-gray-300 text-sm mt-2">Full booking flow coming soon.</p>
                <button onClick={() => setStep(step - 1)} className="mt-6 text-navy text-sm hover:underline">← Go back</button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Your Consultations</h3>
              </div>
              <div className="flex flex-col gap-3">
                {mockConsultations.map((c, i) => (
                  <div key={i} className="border-l-2 border-[#D4B83A] pl-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-navy">{c.date}</p>
                        <p className="text-xs text-gray-400">{c.type} • {c.duration}</p>
                        <p className="text-sm text-gray-600">{c.topic}</p>
                        <p className="text-xs text-gray-400">with {c.doctor}</p>
                      </div>
                      <span className="bg-[#FFF3CC] text-yellow-700 text-xs px-2 py-0.5 rounded-full">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-3">Need Help?</h3>
              {[
                'All consultations are conducted by licensed healthcare professionals',
                'Your privacy and data security are our top priorities',
                'Contact support if you need to reschedule or have questions',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-500">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
