import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { createModel } from '../lib/ai';

const SYSTEM = `You are a wellness education assistant on HarmoHelp.
Analyse the user's symptom tracking data and share 2–3 brief, empathetic observations
about any patterns you notice. Be warm and supportive. Keep your response under 90 words.
Always frame insights as informational only — never as medical advice or diagnosis.`;

function formatLogs(logs) {
  return logs.map((l) => {
    const date = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const syms = (l.symptoms || []).join(', ') || 'none listed';
    return `${date}: symptoms=[${syms}], severity=${l.severity}/10, mood=${l.mood}/10, energy=${l.energy}/10, sleep=${l.sleep}/10`;
  }).join('\n');
}

export default function SymptomInsightCard({ logs = [] }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const generate = useCallback(async (currentLogs) => {
    if (!currentLogs.length) return;
    setLoading(true);
    setError('');
    setInsight('');
    try {
      const model  = createModel(SYSTEM);
      const prompt = `My recent symptom tracking data:\n\n${formatLogs(currentLogs)}\n\nWhat patterns or observations do you notice?`;
      const result = await model.generateContent(prompt);
      setInsight(result.response.text());
    } catch {
      setError('Could not generate insight. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-generate when logs first arrive or a new entry is added
  useEffect(() => {
    if (logs.length) generate(logs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs.length]);

  if (!logs.length) {
    return (
      <div className="border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-[#D4B83A]" />
          <h3 className="font-semibold text-navy text-sm">AI Insight</h3>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Log at least one symptom entry to unlock personalised AI insights.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E8D88A] bg-[#FFFBEF] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#D4B83A]" />
          <h3 className="font-semibold text-navy text-sm">AI Insight</h3>
        </div>
        <button
          onClick={() => generate(logs)}
          disabled={loading}
          className="text-gray-400 hover:text-navy transition disabled:opacity-40"
          title="Refresh insight"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <div className="w-3.5 h-3.5 border-2 border-[#D4B83A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-gray-400 text-xs">Analysing your data…</span>
        </div>
      ) : error ? (
        <p className="text-red-500 text-xs">{error}</p>
      ) : (
        <p className="text-gray-600 text-xs leading-relaxed">{insight}</p>
      )}

      <p className="text-gray-300 text-[10px] mt-3 leading-tight">
        Educational only · Not medical advice · Powered by Gemini
      </p>
    </div>
  );
}
