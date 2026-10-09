-- Apply once to databases created before the initial OAuth return binding was added.
ALTER TABLE poll_oauth ADD COLUMN client_nonce TEXT NOT NULL DEFAULT '';
