import DashboardNav from '../components/DashboardNav';
import { useState } from 'react';
import { Heart, Calendar, Save } from 'lucide-react';

const symptoms = [
  'Mood swings', 'Fatigue', 'Headaches',
  'Bloating', 'Cramps', 'Acne',
  'Breast tenderness', 'Hot flashes', 'Night sweats',
  'Irregular periods', 'Heavy bleeding', 'Anxiety',
  'Depression', 'Irritability', 'Sleep disturbances',
  'Weight gain', 'Hair loss', 'Dry skin',
];

export default function SymptomTrackerPage() {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(3);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggle = (s) => setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-navy mb-1">Symptom Tracker</h1>
        <p className="text-gray-400 text-sm mb-8">Track your symptoms and get personalized insights</p>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={16} className="text-gray-500" />
                <h2 className="font-semibold text-navy">Today's Symptoms</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Select symptoms you're experiencing today:</p>
              <div className="grid grid-cols-3 gap-2 mb-8">
                {symptoms.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(s)}
                      onChange={() => toggle(s)}
                      className="accent-navy"
                    />
                    {s}
                  </label>
                ))}
              </div>

              {[
                { label: 'Overall Severity (1-10)', value: severity, setValue: setSeverity, left: 'Mild', right: 'Severe' },
                { label: 'Mood (1-10)', value: mood, setValue: setMood, left: 'Low', right: 'High' },
                { label: 'Energy Level (1-10)', value: energy, setValue: setEnergy, left: 'Low', right: 'High' },
                { label: 'Sleep Quality (1-10)', value: sleep, setValue: setSleep, left: 'Poor', right: 'Excellent' },
              ].reduce((rows, item, i) => {
                if (i % 2 === 0) rows.push([]);
                rows[rows.length - 1].push(item);
                return rows;
              }, []).map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 gap-6 mb-6">
                  {row.map((item) => (
                    <div key={item.label}>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{item.label}</label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={item.value}
                        onChange={(e) => item.setValue(Number(e.target.value))}
                        className="w-full accent-navy"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{item.left}</span>
                        <span className="font-semibold text-navy">{item.value}</span>
                        <span>{item.right}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details about your symptoms, triggers, or observations..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
                  saved ? 'bg-green-500 text-white' : 'bg-[#FFF3CC] text-navy border border-[#E8D88A] hover:bg-[#FFE88A]'
                }`}
              >
                <Save size={16} />
                {saved ? 'Entry Saved!' : "Save Today's Entry"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Recent Entries</h3>
              </div>
              <p className="text-gray-400 text-sm">No entries yet. Start tracking your symptoms to see patterns and insights.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-4">Quick Stats</h3>
              {['Total Entries', 'This Week', 'Avg Severity', 'Most Common'].map((s) => (
                <div key={s} className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{s}</span>
                  <span className="text-sm font-bold text-[#D4B83A]">—</span>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-3">Tracking Tips</h3>
              {[
                'Track consistently at the same time each day for better patterns',
                'Note potential triggers like stress, diet, or sleep changes',
                'Share your data with healthcare providers for better insights',
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
