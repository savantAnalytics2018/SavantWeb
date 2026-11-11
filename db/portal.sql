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
  scope       TEXT,                     -- the CURRENT proposed scope text (editable until approved)
  scope_version INTEGER NOT NULL DEFAULT 0, -- increments each time a scope is proposed
  approved_scope TEXT,                  -- immutable copy of the text the client approved
  approved_scope_sha TEXT,              -- sha256 of approved_scope (what the client's Approve click carried)
  approved_version INTEGER,             -- which scope_version was approved
  approved_by TEXT,                     -- client email from the signed cookie
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

-- Every proposed scope, forever. Approval rows are never updated afterwards.
CREATE TABLE IF NOT EXISTS scope_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ref         TEXT NOT NULL,
  version     INTEGER NOT NULL,
  body        TEXT NOT NULL,
  sha256      TEXT NOT NULL,
  proposed_at INTEGER NOT NULL,
  approved_at INTEGER,
  approved_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS scope_versions_ref_version ON scope_versions (ref, version);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ref        TEXT NOT NULL,
  kind       TEXT NOT NULL,             -- status:<new> | message:<author> | approved | report
  detail     TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS events_ref ON events (ref, created_at);
