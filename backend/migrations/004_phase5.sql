-- ─────────────────────────────────────────────────────────────────────────
-- NexusOne — Phase 5 migration (004)
--
-- Changes:
--   1. Add attachment_url to maintenance_tickets (file upload support)
--   2. The password_reset_tokens table already exists from migration 001.
--      No schema change needed for password reset.
-- ─────────────────────────────────────────────────────────────────────────

-- Ticket attachment column (stores URL/data-URI of uploaded file)
ALTER TABLE maintenance_tickets
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;
