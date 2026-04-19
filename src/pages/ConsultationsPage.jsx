import DashboardNav from '../components/DashboardNav';
import { useState, useEffect } from 'react';
import { Video, Phone, MessageSquare, Calendar } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { SkeletonBookingList } from '../components/Skeleton';

const consultationTypes = [
  { id: 'video', icon: <Video size={24} />, title: 'Video Call', desc: 'Face-to-face consultation via secure video call', price: 150, duration: '45min' },
  { id: 'phone', icon: <Phone size={24} />, title: 'Phone Call', desc: 'Traditional phone consultation', price: 100, duration: '45min' },
  { id: 'chat', icon: <MessageSquare size={24} />, title: 'Text Chat', desc: 'Written consultation via secure messaging', price: 75, duration: '45min' },
];

const steps = ['Type', 'Expert', 'Schedule', 'Details', 'Confirm'];

const experts = [
  { id: 'Dr. Sarah Johnson', name: 'Dr. Sarah Johnson', specialty: 'Endocrinology' },
  { id: 'Dr. Emily Chen', name: 'Dr. Emily Chen', specialty: 'Reproductive Health' },
  { id: 'Dr. Michael Torres', name: 'Dr. Michael Torres', specialty: 'Integrative Medicine' },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function ConsultationsPage() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.get('/api/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  const handleConfirm = async () => {
    setBookingError('');
    setIsBooking(true);
    try {
      const { data } = await api.post('/api/bookings', {
        type: selectedType,
        expert_id: selectedExpert,
        date: selectedDate,
        time: selectedTime,
        notes,
      });
      setBookings((prev) => [data, ...prev]);
      setStep(0);
      setSelectedType(null);
      setSelectedExpert(null);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      toast.success('Booking confirmed!');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Booking failed. Please try again.';
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setIsBooking(false);
    }
  };

  const canProceed = [
    !!selectedType,
    !!selectedExpert,
    !!selectedDate && !!selectedTime,
    true,
    true,
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-black text-navy mb-1">Book a Consultation</h1>
        <p className="text-gray-400 text-sm mb-8">Connect with hormone health experts for personalized guidance</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            {step === 0 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Choose Consultation Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    onClick={() => canProceed[0] && setStep(1)}
                    className={`px-8 py-3 rounded-xl font-semibold transition ${
                      canProceed[0] ? 'bg-navy text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Select an Expert</h2>
                <div className="flex flex-col gap-4">
                  {experts.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedExpert(e.id)}
                      className={`border-2 rounded-2xl p-4 text-left transition ${
                        selectedExpert === e.id ? 'border-navy bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                          {e.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-navy">{e.name}</p>
                          <p className="text-xs text-gray-400">{e.specialty}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(0)} className="text-navy text-sm hover:underline">← Back</button>
                  <button
                    onClick={() => canProceed[1] && setStep(2)}
                    className={`px-8 py-3 rounded-xl font-semibold transition ${
                      canProceed[1] ? 'bg-navy text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Choose Date & Time</h2>
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Time</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`border rounded-xl py-2 text-sm font-medium transition ${
                          selectedTime === t ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="text-navy text-sm hover:underline">← Back</button>
                  <button
                    onClick={() => canProceed[2] && setStep(3)}
                    className={`px-8 py-3 rounded-xl font-semibold transition ${
                      canProceed[2] ? 'bg-navy text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Additional Details</h2>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes for your expert (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your concerns or anything you'd like to discuss..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-navy resize-none"
                  rows={5}
                />
                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(2)} className="text-navy text-sm hover:underline">← Back</button>
                  <button onClick={() => setStep(4)} className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-navy mb-6">Confirm Booking</h2>
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 flex flex-col gap-3">
                  {[
                    { label: 'Type', value: consultationTypes.find((t) => t.id === selectedType)?.title },
                    { label: 'Expert', value: selectedExpert },
                    { label: 'Date', value: selectedDate },
                    { label: 'Time', value: selectedTime },
                    { label: 'Price', value: `$${consultationTypes.find((t) => t.id === selectedType)?.price}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-navy">{value}</span>
                    </div>
                  ))}
                </div>
                {bookingError && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4">{bookingError}</p>
                )}
                <div className="flex justify-between mt-2">
                  <button onClick={() => setStep(3)} className="text-navy text-sm hover:underline">← Back</button>
                  <button
                    onClick={handleConfirm}
                    disabled={isBooking}
                    className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Booking…' : 'Confirm Booking'}
                  </button>
                </div>
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
              {loadingBookings ? (
                <SkeletonBookingList count={3} />
              ) : bookings.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-sm font-semibold text-navy mb-1">No bookings yet</p>
                  <p className="text-xs text-gray-400 leading-relaxed">Book your first consultation to connect with an expert.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {bookings.map((c) => (
                    <div key={c.id} className="border-l-2 border-[#D4B83A] pl-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-navy">{c.date} at {c.time}</p>
                          <p className="text-xs text-gray-400">{c.type} · 45min</p>
                          <p className="text-xs text-gray-400">with {c.expert_id}</p>
                        </div>
                        <span className="bg-[#FFF3CC] text-yellow-700 text-xs px-2 py-0.5 rounded-full">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
