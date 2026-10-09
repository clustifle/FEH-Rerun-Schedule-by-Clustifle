CREATE TABLE IF NOT EXISTS beta_heroes(id TEXT PRIMARY KEY, record TEXT NOT NULL CHECK(json_valid(record)), revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS beta_versions(version TEXT PRIMARY KEY, release_date TEXT, sort_order INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS beta_watchlist(user_id TEXT NOT NULL,hero_id TEXT NOT NULL REFERENCES beta_heroes(id) ON DELETE CASCADE,list_name TEXT NOT NULL DEFAULT 'Following',PRIMARY KEY(user_id,hero_id));
CREATE TABLE IF NOT EXISTS beta_history(id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, created_at TEXT NOT NULL, label TEXT NOT NULL, before_json TEXT NOT NULL, after_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS beta_assertions(id TEXT PRIMARY KEY,valid INTEGER NOT NULL CHECK(valid=1));
PRAGMA foreign_keys=ON;
