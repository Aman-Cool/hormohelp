import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createModel } from '../lib/ai';

const SYSTEM = `You are Harmo, a friendly hormonal health education assistant on HarmoHelp.

You help users understand hormonal health concepts, explain common symptoms in an educational context, and share general wellness tips around sleep, stress, and nutrition as they relate to hormonal balance.

Rules you must always follow:
- Keep responses concise: 2–4 sentences unless the user explicitly asks for more detail
- Always clarify that your responses are educational only, not medical advice
- Recommend consulting a qualified healthcare provider for any medical concerns
- Never diagnose conditions or recommend specific medications or supplements
- Be warm, empathetic, and supportive
- If the topic is outside hormonal health, gently redirect`;

const STARTERS = [
  'What is cortisol and how does it affect mood?',
  'Why do I feel more tired before my period?',
  'How does sleep affect hormone levels?',
];

export default function AIChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const chatSessionRef  = useRef(null);
  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      const model = createModel(SYSTEM, { maxOutputTokens: 400 });
      chatSessionRef.current = model.startChat();
    }
  }, [isOpen]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const result = await chatSessionRef.current.sendMessageStream(trimmed);
      let full = '';
      for await (const chunk of result.stream) {
        full += chunk.text();
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: full },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [streaming]);

  if (!user) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[340px] sm:w-[380px] max-h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#D4B83A] flex items-center justify-center">
                <Sparkles size={14} className="text-navy" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">Harmo</p>
                <p className="text-[11px] text-gray-300 mt-0.5">AI Health Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-11 h-11 rounded-full bg-[#FFF3CC] flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-[#D4B83A]" />
                </div>
                <p className="text-navy font-semibold text-sm mb-1">Hi, I'm Harmo!</p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed max-w-[240px] mx-auto">
                  Ask me anything about hormonal health and wellness.
                </p>
                <div className="space-y-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs bg-[#FFFBEF] border border-[#E8D88A] rounded-xl px-3 py-2 text-navy hover:bg-[#FFF3CC] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mb-0.5">
                      <Sparkles size={10} className="text-[#D4B83A]" />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-navy text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-700 rounded-bl-none'
                  }`}>
                    {msg.content ? msg.content : (
                      <span className="flex items-center gap-1 py-0.5">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex-shrink-0">
            <p className="text-[10px] text-amber-700 text-center">
              Educational only · Not medical advice · Always consult a doctor
            </p>
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hormonal health…"
              disabled={streaming}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="w-8 h-8 bg-navy text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition disabled:opacity-40 flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-4 right-4 w-13 h-13 w-[52px] h-[52px] bg-navy text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition z-50"
        aria-label={isOpen ? 'Close health assistant' : 'Open health assistant'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  );
}
