
CREATE TABLE IF NOT EXISTS special_rate_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), ranges_json TEXT NOT NULL, revision INTEGER NOT NULL,
 updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
);
