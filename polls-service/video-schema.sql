CREATE TABLE IF NOT EXISTS community_videos (id TEXT PRIMARY KEY,github_id TEXT NOT NULL,content_type TEXT NOT NULL,size INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS community_video_chunks (video_id TEXT NOT NULL,position INTEGER NOT NULL,bytes BLOB NOT NULL,PRIMARY KEY(video_id,position));
CREATE INDEX IF NOT EXISTS community_videos_owner ON community_videos(github_id,created_at);
