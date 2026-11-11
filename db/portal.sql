-- Client portal for paid studies (twindetail.<domain>/s/<reference>).
-- Apply once per environment:
--   npx wrangler d1 execute savantweb-portal --remote --file=db/portal.sql --config wrangler.test.jsonc
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS studies (
  ref         TEXT PRIMARY KEY,
  package     TEXT NOT NULL,
  status      TEXT NOT NULL,            -- submitted | reviewing | needs_input | scope_proposed | approved | running | delivered | closed
  email       TEXT NOT NULL,            -- client email (lower-cased)
  name        TEXT NOT NULL,
  company     TEXT NOT NULL,
  answers     TEXT NOT NULL,            -- the questionnaire as submitted (JSON)
  scope       TEXT,                     -- Savant's scope confirmation text, shown above the Approve button
  approved_at INTEGER,
  report_key  TEXT,                     -- R2 object key of the delivered report
  report_name TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ref        TEXT NOT NULL,
  author     TEXT NOT NULL,             -- client | savant
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_ref ON messages (ref, created_at);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ref        TEXT NOT NULL,
  kind       TEXT NOT NULL,             -- status:<new> | message:<author> | approved | report
  detail     TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS events_ref ON events (ref, created_at);
