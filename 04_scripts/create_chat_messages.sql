-- Create chat_messages table for persistent survivor conversations
-- Run against thecamp_db: psql -U aimph -d thecamp_db -f create_chat_messages.sql

CREATE TABLE IF NOT EXISTS game.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    save_slot_id UUID NOT NULL REFERENCES game.save_slots(id) ON DELETE CASCADE,
    survivor_id UUID NOT NULL REFERENCES game.survivors(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL CHECK (speaker IN ('player', 'survivor')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for loading conversation history
CREATE INDEX IF NOT EXISTS idx_chat_messages_lookup
    ON game.chat_messages (save_slot_id, survivor_id, created_at DESC);

-- Grant access to the app user
GRANT SELECT, INSERT, DELETE ON game.chat_messages TO thecamp_api;
GRANT USAGE, SELECT ON SEQUENCE game.chat_messages_id_seq TO thecamp_api;

-- RLS policy matching the save_slots pattern
ALTER TABLE game.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_policy ON game.chat_messages
    USING (save_slot_id::text = current_setting('app.current_save_slot_id', true));
