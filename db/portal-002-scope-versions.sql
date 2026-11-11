-- Migration for databases created from the FIRST portal.sql (before scope versioning).
-- Skip this if db/portal.sql was applied fresh at or after commit "scope versioning".
--   npx wrangler d1 execute savantweb-portal --remote --file=db/portal-002-scope-versions.sql --config wrangler.test.jsonc
ALTER TABLE studies ADD COLUMN scope_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE studies ADD COLUMN approved_scope TEXT;
ALTER TABLE studies ADD COLUMN approved_scope_sha TEXT;
ALTER TABLE studies ADD COLUMN approved_version INTEGER;
ALTER TABLE studies ADD COLUMN approved_by TEXT;
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
