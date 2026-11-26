/**
 * AIAssistant — /student/assistant
 * Calls POST /assistant/chat — real backend (Gemini or canned fallback).
 * API key stays server-side. The frontend never touches it.
 */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RotateCcw, Zap } from 'lucide-react';
import { api } from '../../services/apiClient.js';

const SUGGESTIONS = [
  'How do I book a study room?',
  'Show me my attendance summary',
  'What events are happening this week?',
  'How do I report a maintenance issue?',
  'What time does the library close?',
  'Where is the CS lab?',
];

function formatMsg(text) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    );
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

const INIT_MSG = {
  id: 0, from: 'bot',
  text: "Hey there! I'm **Nexus AI**, your smart campus assistant. 👋\n\nI can help you find rooms, check schedules, answer questions about services, and more. What would you like to know today?",
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([INIT_MSG]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [powered,  setPowered]  = useState(null); // 'gemini' | 'canned' | null
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function send(text) {
    if (!text.trim() || typing) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    /* Build history for context (last 10 non-system messages) */
    const history = messages.slice(-10).map(m => ({ from: m.from, text: m.text }));

    try {
      const res = await api('/assistant/chat', {
        method: 'POST',
        body: { message: text.trim(), history },
      });
      const reply = res.data?.reply ?? "Sorry, I couldn't generate a response. Please try again.";
      if (res.data?.powered) setPowered(res.data.powered);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: e.status === 429
          ? "I'm receiving too many requests. Please wait a moment before sending another message. 🕐"
          : "I'm having trouble connecting right now. Please check your connection and try again. 🔌",
      }]);
    } finally {
      setTyping(false);
    }
  }

  const reset = () => {
    setMessages([{ ...INIT_MSG, id: Date.now() }]);
    setPowered(null);
  };

  return (
    <div className="stack" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#4338ca,#22d3ee)', display: 'grid', placeItems: 'center' }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Nexus AI Assistant</h1>
            <p className="muted small" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              {powered === 'gemini'
                ? <><Zap size={12} color="var(--ok)" /> Powered by Gemini · Always available</>
                : powered === 'canned'
                  ? <><Sparkles size={12} /> Campus Intelligence · Always available</>
                  : 'Campus Intelligence · Always available'
              }
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge--done" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
            Online
          </span>
          <button className="btn btn--ghost btn--sm" onClick={reset}>
            <RotateCcw size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Suggestions (shown only at start) */}
      {messages.length <= 1 && (
        <div>
          <p className="muted small" style={{ marginBottom: 8 }}>
            <Sparkles size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Try asking:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn btn--ghost btn--sm" style={{ fontSize: '.78rem' }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card" style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div className="chat">
          {messages.map(msg => (
            <div key={msg.id} className={`chat__msg chat__msg--${msg.from}`}>
              {msg.from === 'bot' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4338ca,#22d3ee)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#fff" />
                </div>
              )}
              <div className="chat__bubble">{formatMsg(msg.text)}</div>
            </div>
          ))}

          {typing && (
            <div className="chat__msg chat__msg--bot">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4338ca,#22d3ee)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Bot size={16} color="#fff" />
              </div>
              <div className="chat__bubble" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)',
                    animation: 'pulse 1.2s ease infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <form style={{ display: 'flex', gap: 10 }} onSubmit={e => { e.preventDefault(); send(input); }}>
        <label className="search" style={{ flex: 1, margin: 0 }}>
          <input
            type="text"
            placeholder="Ask Nexus AI anything about campus…"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={typing}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={!input.trim() || typing} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
