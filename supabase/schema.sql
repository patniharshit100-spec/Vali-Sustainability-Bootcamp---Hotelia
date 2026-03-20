-- =============================================================================
-- Hotel Insight — Supabase Schema
-- Run this once in the Supabase SQL Editor (Database → SQL Editor → New query)
-- =============================================================================

-- ─── 1. reservations ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name          TEXT NOT NULL,
  guest_email         TEXT,
  guest_phone         TEXT,
  guest_country       TEXT,                         -- ISO: PRT GBR FRA ESP DEU
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL,
  room_type           TEXT,                         -- Standard Supérieure Deluxe Suite Familiale
  room_number         TEXT,
  status              TEXT DEFAULT 'confirmed',     -- confirmed checked-in checked-out cancelled no-show
  channel             TEXT,                         -- Booking.com Expedia Direct WhatsApp Email Phone
  total_price         NUMERIC,
  amount_paid         NUMERIC,
  number_of_guests    INTEGER,
  meal_plan           TEXT,                         -- BB HB FB SC
  special_requests    TEXT[],
  is_repeated_guest   BOOLEAN DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. rooms ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rooms (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number                   TEXT UNIQUE NOT NULL,
  floor                    INTEGER,
  type                     TEXT,                    -- Standard Supérieure Deluxe Suite Familiale
  status                   TEXT DEFAULT 'available',-- available occupied maintenance cleaning
  max_occupancy            INTEGER,
  base_price               NUMERIC,
  amenities                TEXT[],
  current_reservation_id   UUID REFERENCES reservations(id)
);

-- ─── 3. messages ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id      UUID REFERENCES reservations(id),
  guest_name          TEXT NOT NULL,
  channel             TEXT,                         -- Email Booking.com WhatsApp
  direction           TEXT,                         -- inbound outbound
  subject             TEXT,
  message_text        TEXT NOT NULL,
  language            TEXT,                         -- fr en de es pt
  category            TEXT,                         -- reservation cancellation refund information complaint maintenance modification compliment
  urgency             TEXT,                         -- high medium low
  status              TEXT DEFAULT 'unread',        -- unread read ai-reply-ready replied auto-resolved
  ai_suggested_reply  TEXT,
  conversation_id     TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. tasks ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  category            TEXT,                         -- maintenance housekeeping front-desk other
  priority            TEXT,                         -- urgent normal low
  status              TEXT DEFAULT 'todo',          -- todo in-progress done
  assigned_to         TEXT,
  room_number         TEXT,
  source_type         TEXT,                         -- guest-request scheduled manual ai-detected
  source_message_id   UUID REFERENCES messages(id),
  due_date            TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. reviews ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name       TEXT,
  platform         TEXT,                            -- Booking.com TripAdvisor Google
  rating           INTEGER,
  review_text      TEXT,
  language         TEXT,
  ai_response      TEXT,
  response_status  TEXT DEFAULT 'draft',            -- draft approved posted
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. competitors ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name        TEXT,
  standard_price    NUMERIC,
  superieure_price  NUMERIC,
  deluxe_price      NUMERIC,
  suite_price       NUMERIC,
  famille_price     NUMERIC,
  wifi              BOOLEAN,
  breakfast_price   NUMERIC,
  parking_price     NUMERIC,
  pool              BOOLEAN,
  spa_price         NUMERIC,
  rating            NUMERIC
);

-- ─── 7. staff ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  role        TEXT,                                 -- manager receptionist housekeeper maintenance porter
  is_on_duty  BOOLEAN DEFAULT true,
  phone       TEXT
);

-- ─── 8. insights ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text         TEXT NOT NULL,
  category     TEXT,                                -- pricing operations review-alert daily-briefing
  action_type  TEXT,
  action_id    TEXT,
  priority     TEXT DEFAULT 'medium',
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── 9. booking_sources ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT,
  platform        TEXT,
  ical_url        TEXT,
  webhook_secret  TEXT,
  is_active       BOOLEAN DEFAULT true,
  last_synced     TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES — speed up the most common queries
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_reservations_check_in    ON reservations (check_in);
CREATE INDEX IF NOT EXISTS idx_reservations_status      ON reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_channel     ON reservations (channel);
CREATE INDEX IF NOT EXISTS idx_messages_status          ON messages (status);
CREATE INDEX IF NOT EXISTS idx_messages_urgency         ON messages (urgency);
CREATE INDEX IF NOT EXISTS idx_messages_conversation    ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status             ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_category           ON tasks (category);
CREATE INDEX IF NOT EXISTS idx_rooms_status             ON rooms (status);

-- =============================================================================
-- ROW LEVEL SECURITY — permissive for now (lock down later with auth)
-- =============================================================================

ALTER TABLE reservations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights         ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_sources  ENABLE ROW LEVEL SECURITY;

-- Permissive "allow all for anon key" policies:
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'reservations','rooms','messages','tasks',
    'reviews','competitors','staff','insights','booking_sources'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "anon_all" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END;
$$;

-- =============================================================================
-- REALTIME — enable on the 5 tables that need live push
-- =============================================================================

-- Make sure the tables are in the realtime publication and have FULL replica identity
-- so UPDATE/DELETE events carry the old row values.

ALTER TABLE reservations  REPLICA IDENTITY FULL;
ALTER TABLE messages      REPLICA IDENTITY FULL;
ALTER TABLE tasks         REPLICA IDENTITY FULL;
ALTER TABLE reviews       REPLICA IDENTITY FULL;
ALTER TABLE insights      REPLICA IDENTITY FULL;

-- Add to the supabase_realtime publication (safe to run multiple times)
DO $$
BEGIN
  -- reservations
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'reservations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
  END IF;
  -- messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  -- tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
  -- reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;
  -- insights
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'insights'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE insights;
  END IF;
END;
$$;
