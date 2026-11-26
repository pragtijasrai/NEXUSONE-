/**
 * AI Assistant routes
 * POST /assistant/chat  — authenticated, rate-limited
 *
 * Uses Google Gemini if GEMINI_API_KEY is set.
 * Falls back to enhanced canned responses when no key is configured.
 * The API key NEVER leaves the backend — the frontend only calls this endpoint.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import rateLimit from 'express-rate-limit';

const r = Router();

/* 20 requests per minute per user (generous for a chat UI) */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => `ai:${req.user?.sub ?? req.ip}`,
  handler: (_, res) => res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait a moment before sending another message.',
    errors: [{ code: 'RATE_LIMIT' }],
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Canned response fallback (used when no Gemini key) ── */
const CANNED = {
  'room':          'You can book a room from the **Room Booking** page in your sidebar. Filter by type, pick an available slot, and confirm. Bookings are confirmed instantly!',
  'book':          'To book a room: go to Room Booking → choose a room → select date and time → confirm. You can cancel from the same page.',
  'library':       'The main library is open **8 AM – 10 PM** (until midnight during exam week). Digital resources are available 24/7 through the portal.',
  'cs lab':        'The CS Lab (CS-204) is on the 2nd floor of CS Block. It has 35 computers, a projector, and is open Mon–Sat 8 AM – 8 PM.',
  'maintenance':   'Report issues via **Report Issue** on your dashboard or the Maintenance page. Enter location, description and priority — you\'ll get a ticket number to track progress.',
  'event':         'Browse upcoming events on the **Campus Events** page. Click Register to RSVP. Faculty can create events too.',
  'announcement':  'Announcements appear on your dashboard and the Announcements page, filtered for your role. Urgent ones are highlighted.',
  'attendance':    'Your attendance summary is on **My Classes → Attendance**. You need ≥75% per subject. The page shows how many classes you can safely miss.',
  'password':      'To change your password, go to **Profile → Security → Change Password**. If you forgot it, use the Forgot Password link on the login page.',
  'lost':          'Report or browse lost & found items on the **Lost & Found** page. You can report a found item or claim a lost one.',
  'assignment':    'Your assignments are on the **My Classes** page. Faculty post deadlines and you submit through the portal (file upload coming soon).',
  'schedule':      'Your weekly timetable is on **My Classes → Timetable**. It shows all sessions Mon–Fri with faculty and room details.',
  'notification':  'Your notifications appear in the bell icon and on the **Notifications** page. You can mark individual or all as read.',
  'profile':       'Update your name, phone and notification preferences on the **Profile** page. Photo uploads are supported (max 1 MB, PNG/JPG).',
  'default':       "I'm Nexus AI, your campus assistant. I can help with room bookings, timetables, attendance, maintenance, announcements, events, lost & found, and account settings. What would you like to know?",
};

function cannedResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(CANNED)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return CANNED.default;
}

/* ── Gemini AI call ── */
async function geminiChat(message, history = []) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /* System context */
  const systemPrompt = `You are Nexus AI, the campus assistant for NexusOne — a university campus management platform for Chitkara University.
You help students, faculty, and staff with:
- Room bookings (via the Room Booking page)
- Timetables and attendance (via My Classes)
- Maintenance requests (via the Maintenance page)
- Campus events and announcements
- Lost and Found
- Profile and account settings
Keep answers concise (3-5 sentences max), friendly and campus-focused.
If asked something outside campus scope, politely redirect to campus topics.`;

  /* Build Gemini chat history format */
  const geminiHistory = history.map(h => ({
    role: h.from === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }],
  }));

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood! I'm Nexus AI, ready to help with campus questions." }] },
      ...geminiHistory,
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

r.post('/chat', authenticate, chatLimiter, asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new AppError(400, 'message is required', 'VALIDATION');
  }
  if (message.length > 1000) {
    throw new AppError(400, 'Message too long (max 1000 characters)', 'VALIDATION');
  }

  let reply;

  if (env.geminiApiKey) {
    try {
      reply = await geminiChat(message.trim(), history.slice(-10));
    } catch (err) {
      logger.warn({ err: err.message }, 'Gemini API failed — falling back to canned response');
      reply = cannedResponse(message);
    }
  } else {
    /* No API key configured — use enhanced canned responses */
    reply = cannedResponse(message);
  }

  res.json({
    success: true,
    message: 'Response generated',
    data: { reply, powered: env.geminiApiKey ? 'gemini' : 'canned' },
  });
}));

export default r;
