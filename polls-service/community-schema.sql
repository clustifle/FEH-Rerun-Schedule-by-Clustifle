CREATE TABLE IF NOT EXISTS community_connections (
 github_id TEXT PRIMARY KEY, website_id TEXT NOT NULL, login TEXT NOT NULL,
 encrypted_token TEXT NOT NULL, public_reads INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS community_cache (key TEXT PRIMARY KEY, payload TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS community_images (
 id TEXT PRIMARY KEY, github_id TEXT NOT NULL, content_type TEXT NOT NULL,
 bytes BLOB NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS community_images_owner ON community_images(github_id,created_at);

CREATE TABLE IF NOT EXISTS forum_moderators (github_id TEXT PRIMARY KEY,website_id TEXT NOT NULL,assigned_by TEXT NOT NULL,created_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS forum_moderation (post_number INTEGER NOT NULL,target_id TEXT NOT NULL,hidden INTEGER NOT NULL,reason TEXT NOT NULL,actor_login TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(post_number,target_id));
CREATE TABLE IF NOT EXISTS forum_audit (id INTEGER PRIMARY KEY AUTOINCREMENT,post_number INTEGER,target_id TEXT,action TEXT NOT NULL,reason TEXT NOT NULL,actor_login TEXT NOT NULL,actor_role TEXT NOT NULL,created_at TEXT NOT NULL);
