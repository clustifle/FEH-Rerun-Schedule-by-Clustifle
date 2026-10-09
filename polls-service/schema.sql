PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS polls (
 id TEXT PRIMARY KEY, question TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed','archived')),
 featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
 allow_change INTEGER NOT NULL DEFAULT 1 CHECK(allow_change IN (0,1)),
 results_mode TEXT NOT NULL DEFAULT 'after_vote' CHECK(results_mode IN ('public','after_vote','closed')),
 closes_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS poll_choices (
 id TEXT PRIMARY KEY, poll_id TEXT NOT NULL REFERENCES polls(id), label TEXT NOT NULL, position INTEGER NOT NULL,
 UNIQUE(poll_id,id), UNIQUE(poll_id,position)
);
CREATE TABLE IF NOT EXISTS poll_votes (
 poll_id TEXT NOT NULL REFERENCES polls(id), github_id TEXT NOT NULL, choice_id TEXT NOT NULL,
 updated_at TEXT NOT NULL, PRIMARY KEY(poll_id,github_id),
 FOREIGN KEY(poll_id,choice_id) REFERENCES poll_choices(poll_id,id)
);
CREATE INDEX IF NOT EXISTS poll_vote_counts ON poll_votes(poll_id,choice_id);
CREATE INDEX IF NOT EXISTS poll_public_list ON polls(status,featured,created_at);
CREATE TABLE IF NOT EXISTS poll_staff (github_id TEXT PRIMARY KEY, login TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS poll_sessions (token_hash TEXT PRIMARY KEY, github_id TEXT NOT NULL, login TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS poll_oauth (state TEXT PRIMARY KEY, verifier TEXT NOT NULL, return_path TEXT NOT NULL, expires_at INTEGER NOT NULL, client_nonce TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS poll_history (id INTEGER PRIMARY KEY AUTOINCREMENT, github_id TEXT NOT NULL, login TEXT NOT NULL, action TEXT NOT NULL, poll_id TEXT, label TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS poll_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS poll_write_guard (ticket TEXT PRIMARY KEY, valid INTEGER NOT NULL CHECK(valid=1));
