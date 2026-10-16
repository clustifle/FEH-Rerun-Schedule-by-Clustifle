
-- One private working draft per website account. Clearing keeps its revision so stale devices cannot revive it.
CREATE TABLE IF NOT EXISTS community_drafts (
 website_id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
 category_id TEXT NOT NULL, flair TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>0),
 deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN (0,1)), updated_at TEXT NOT NULL
);
