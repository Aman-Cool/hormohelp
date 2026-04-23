import DashboardNav from '../components/DashboardNav';
import SymptomInsightCard from '../components/SymptomInsightCard';
import { useState, useEffect } from 'react';
import { Heart, Calendar, Save } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { SkeletonLogList } from '../components/Skeleton';

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          api.get('/api/symptoms?limit=5'),
          api.get('/api/symptoms/stats'),
        ]);
        setRecentLogs(logsRes.data.logs);
        setStats(statsRes.data);
      } catch (_) {
        // silently fail — UI shows defaults
      } finally {
        setLoadingLogs(false);
      }
    };
    load();
  }, []);

  const toggle = (s) => setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      const { data: newLog } = await api.post('/api/symptoms', {
        symptoms: selected,
        severity,
        mood,
        energy,
        sleep,
        notes,
      });
      setRecentLogs((prev) => [newLog, ...prev.slice(0, 4)]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setSelected([]);
      setSeverity(3);
      setMood(5);
      setEnergy(5);
      setSleep(5);
      setNotes('');
      toast.success('Symptom entry saved!');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save. Please try again.';
      setSaveError(msg);
      toast.error(msg);
      return;
    } finally {
      setIsSaving(false);
    }
    // Best-effort stats refresh — failure here doesn't affect the confirmed save
    try {
      const { data: newStats } = await api.get('/api/symptoms/stats');
      setStats(newStats);
    } catch (_) {}
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-black text-navy mb-1">Symptom Tracker</h1>
        <p className="text-gray-400 text-sm mb-8">Track your symptoms and get personalized insights</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <div className="border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={16} className="text-gray-500" />
                <h2 className="font-semibold text-navy">Today's Symptoms</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Select symptoms you're experiencing today:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
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
                <div key={ri} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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

              {saveError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4">{saveError}</p>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  saved ? 'bg-green-500 text-white' : 'bg-[#FFF3CC] text-navy border border-[#E8D88A] hover:bg-[#FFE88A]'
                }`}
              >
                <Save size={16} />
                {isSaving ? 'Saving…' : saved ? 'Entry Saved!' : "Save Today's Entry"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-500" />
                <h3 className="font-semibold text-navy">Recent Entries</h3>
              </div>
              {loadingLogs ? (
                <SkeletonLogList count={3} />
              ) : recentLogs.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm font-semibold text-navy mb-1">No symptoms logged yet</p>
                  <p className="text-xs text-gray-400 leading-relaxed">Start tracking today to discover patterns and insights over time.</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                    <p className="text-sm font-medium text-navy">{formatDate(log.date)}</p>
                    <p className="text-xs text-gray-400">Severity: {log.severity}/10 · {(log.symptoms || []).length} symptom{(log.symptoms || []).length !== 1 ? 's' : ''}</p>
                    {(log.symptoms || []).length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{(log.symptoms || []).slice(0, 3).join(', ')}{(log.symptoms || []).length > 3 ? '…' : ''}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-navy mb-4">Quick Stats</h3>
              {[
                { label: 'Total Entries', value: stats ? stats.total : '—' },
                { label: 'This Week', value: stats ? stats.thisWeek : '—' },
                { label: 'Avg Severity', value: stats ? stats.avgSeverity : '—' },
                { label: 'Most Common', value: stats ? stats.mostCommon : '—' },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{s.label}</span>
                  <span className="text-sm font-bold text-[#D4B83A] max-w-[120px] text-right truncate">{s.value}</span>
                </div>
              ))}
            </div>

            <SymptomInsightCard logs={recentLogs} />

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
