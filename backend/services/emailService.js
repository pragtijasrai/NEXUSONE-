/**
 * Email service — sends transactional emails via Nodemailer (SMTP).
 *
 * Graceful degradation:
 *   - If SMTP credentials are not configured, emails are logged to console
 *     instead of sent. This keeps development smooth without a mail server.
 *   - In production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.
 *
 * Security:
 *   - API credentials live in environment variables only — never in code.
 *   - Password reset tokens are shown in the email link; the raw token is
 *     never stored in the DB (only its SHA-256 hash is stored).
 */

import nodemailer from 'nodemailer';
import { env, isDev } from '../config/env.js';
import { logger } from '../utils/logger.js';

/* ── Create transporter once ── */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    /* No SMTP configured — use Ethereal (fake SMTP) in dev, log in test */
    return null;
  }

  transporter = nodemailer.createTransport({
    host:   env.smtpHost,
    port:   env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

/**
 * Send an email.
 * Falls back to console.log when SMTP is not configured (dev mode).
 */
async function send({ to, subject, html, text }) {
  const transport = getTransporter();

  if (!transport) {
    /* Dev fallback — log the email content */
    logger.info({ to, subject, text: text?.slice(0, 200) }, 'EMAIL (dev fallback — not sent)');
    return;
  }

  try {
    const info = await transport.sendMail({
      from:    env.smtpFrom,
      to,
      subject,
      html,
      text,
    });
    logger.info({ messageId: info.messageId, to }, 'Email sent');
  } catch (err) {
    /* Log but don't throw — email failure should not break the API response */
    logger.error({ err, to, subject }, 'Failed to send email');
  }
}

/* ── Template: Password Reset ── */
export async function sendPasswordReset({ to, name, resetUrl, expiresInMinutes = 30 }) {
  const subject = 'Reset your NexusOne password';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:1.4rem;font-weight:700;">NexusOne</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.75);font-size:.9rem;">Campus Management Platform</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <h2 style="margin:0 0 12px;color:#1e293b;font-size:1.2rem;">Reset your password</h2>
          <p style="margin:0 0 20px;color:#475569;line-height:1.6;">Hi ${name},</p>
          <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
            We received a request to reset the password for your NexusOne account.
            Click the button below to create a new password. This link expires in
            <strong>${expiresInMinutes} minutes</strong>.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td align="center" style="background:#4338ca;border-radius:9px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-weight:700;font-size:.95rem;text-decoration:none;">
                Reset Password →
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;color:#94a3b8;font-size:.82rem;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>
          <p style="margin:0;color:#94a3b8;font-size:.82rem;">
            Or copy this link: <span style="color:#4338ca;">${resetUrl}</span>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:.78rem;text-align:center;">
            NexusOne · Chitkara University Campus Platform<br>
            This is an automated message, please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name},\n\nReset your NexusOne password by visiting:\n${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.\n\nIf you didn't request this, ignore this email.`;

  await send({ to, subject, html, text });
}

/* ── Template: Booking Confirmation ── */
export async function sendBookingConfirmation({ to, name, roomName, startTime, endTime, purpose }) {
  const subject = 'Room booking confirmed — NexusOne';
  const dtOpts  = { dateStyle: 'medium', timeStyle: 'short' };
  const start   = new Date(startTime).toLocaleString('en-IN', dtOpts);
  const end     = new Date(endTime).toLocaleString('en-IN', dtOpts);

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f1f5f9;margin:0;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <tr><td style="background:linear-gradient(135deg,#4338ca,#6366f1);padding:28px 36px;">
        <h1 style="margin:0;color:#fff;font-size:1.3rem;font-weight:700;">Booking Confirmed ✓</h1>
      </td></tr>
      <tr><td style="padding:30px 36px;">
        <p style="color:#475569;line-height:1.6;margin:0 0 20px;">Hi ${name}, your room booking is confirmed!</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
          <tr><td style="padding:6px 0;color:#64748b;font-size:.88rem;">Room</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${roomName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:.88rem;">Start</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${start}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:.88rem;">End</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${end}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:.88rem;">Purpose</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${purpose || '—'}</td></tr>
        </table>
        <p style="color:#94a3b8;font-size:.82rem;margin:0;">You can cancel this booking from your Room Booking page on NexusOne.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `Hi ${name},\n\nYour booking for ${roomName} is confirmed.\nStart: ${start}\nEnd: ${end}\nPurpose: ${purpose || '—'}`;
  await send({ to, subject, html, text });
}

/* ── Template: Ticket Status Update ── */
export async function sendTicketUpdate({ to, name, ticketId, issue, newStatus }) {
  const subject = `Maintenance ticket #${ticketId} updated — NexusOne`;
  const statusColors = { assigned:'#f59e0b', in_progress:'#4338ca', resolved:'#10b981', closed:'#64748b' };
  const color = statusColors[newStatus] || '#4338ca';

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f1f5f9;margin:0;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <tr><td style="background:linear-gradient(135deg,${color},${color}cc);padding:28px 36px;">
        <h1 style="margin:0;color:#fff;font-size:1.3rem;font-weight:700;">Ticket Updated</h1>
      </td></tr>
      <tr><td style="padding:30px 36px;">
        <p style="color:#475569;line-height:1.6;margin:0 0 16px;">Hi ${name}, your maintenance request has been updated.</p>
        <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:.88rem;">Ticket #${ticketId}</p>
          <p style="margin:0 0 12px;color:#1e293b;font-weight:600;">${issue}</p>
          <span style="display:inline-block;background:${color}20;color:${color};font-weight:700;font-size:.82rem;padding:4px 12px;border-radius:99px;">
            Status: ${newStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <p style="color:#94a3b8;font-size:.82rem;margin:0;">Track your ticket status on NexusOne under Maintenance.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `Hi ${name},\n\nYour maintenance ticket #${ticketId} "${issue}" has been updated to: ${newStatus}.`;
  await send({ to, subject, html, text });
}
