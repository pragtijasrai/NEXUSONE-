import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, RotateCcw } from 'lucide-react';

const SUGGESTIONS = [
  'Where is the Computer Science lab?',
  'What time does the library close today?',
  'How do I book a study room?',
  'What events are happening this week?',
  'Who is the Head of CS Department?',
  'How do I report a maintenance issue?',
];

const CANNED = {
  'computer science lab': 'The Computer Science Lab (CS-204) is located on the 2nd floor of the CS Block. It\'s open Mon–Sat, 8 AM–8 PM. Currently it has 35 computers and a projector available. 🖥️',
  'library': 'The main library is open until **midnight** this week due to midterm season! Normal hours are 8 AM–10 PM. You can access digital resources 24/7 through the portal. 📚',
  'book a room': 'To book a room:\n1. Go to **Room Booking** in the sidebar\n2. Filter by type (Study, Lab, Seminar…)\n3. Pick an available room and click "Book Now"\n4. Choose your date, time slot and purpose\n\nBookings are confirmed instantly! 🏫',
  'events': 'This week\'s highlights:\n• **Tech Fest 2026** – Oct 28 at 18:00, Innovation Hub 🚀\n• **Career Fair** – Nov 03 at 10:00, Main Auditorium 💼\n• **Hackathon** – Nov 15 at 09:00, CS Lab Block 💻\n\nHead to the Events page to register!',
  'head of cs': 'The Head of the Computer Science Department is **Prof. Ashwin Mehta**. Office hours are Tuesday & Thursday, 2–4 PM in room CS-501. 👨‍🏫',
  'maintenance': 'To report a maintenance issue:\n1. Click **Report Issue** in Quick Actions on your dashboard\n2. Describe the problem and select the location\n3. You\'ll receive a ticket number and can track progress in real time! 🔧',
  'default': 'That\'s a great question! I\'m Nexus AI, your campus assistant. I can help with room locations, schedules, booking rooms, events, and campus services. Try asking me something specific about Northbridge University! 😊',
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(CANNED)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return CANNED.default;
}

function formatMsg(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    );
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { id: 0, from: 'bot', text: 'Hey there! I\'m **Nexus AI**, your smart campus assistant. 👋\n\nI can help you find rooms, check schedules, answer questions about services, and more. What would you like to know today?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getResponse(text);
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
    }, 900);
  };

  const reset = () => {
    setMessages([{ id: 0, from: 'bot', text: 'Chat cleared! How can I help you? 😊' }]);
  };

  return (
    <div className="stack" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#4338ca,#22d3ee)', display:'grid', placeItems:'center' }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:'1.2rem' }}>Nexus AI Assistant</h1>
            <p className="muted small" style={{ margin:0 }}>Powered by Campus Intelligence · Always available</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span className="badge badge--done" style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--ok)', display:'inline-block' }} />
            Online
          </span>
          <button className="btn btn--ghost btn--sm" onClick={reset}>
            <RotateCcw size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div>
          <p className="muted small" style={{ marginBottom:8 }}>
            <Sparkles size={13} style={{ verticalAlign:'middle', marginRight:4 }} />
            Try asking:
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn btn--ghost btn--sm" style={{ fontSize:'.78rem' }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="card" style={{ flex:1, overflow:'auto', padding:'20px' }}>
        <div className="chat">
          {messages.map(msg => (
            <div key={msg.id} className={`chat__msg chat__msg--${msg.from}`}>
              {msg.from === 'bot' && (
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#4338ca,#22d3ee)', display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Bot size={16} color="#fff" />
                </div>
              )}
              <div className="chat__bubble">
                {formatMsg(msg.text)}
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat__msg chat__msg--bot">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#4338ca,#22d3ee)', display:'grid', placeItems:'center', flexShrink:0 }}>
                <Bot size={16} color="#fff" />
              </div>
              <div className="chat__bubble" style={{ display:'flex', gap:4, alignItems:'center', padding:'12px 16px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--primary)', animation:'pulse 1.2s ease infinite', animationDelay:`${i*0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <form style={{ display:'flex', gap:10 }} onSubmit={e => { e.preventDefault(); send(input); }}>
        <label className="search" style={{ flex:1, margin:0 }}>
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
