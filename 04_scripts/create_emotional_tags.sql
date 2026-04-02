-- Create emotional_tags table for conversation memory
-- Run: psql -U aimph -d thecamp_db -f create_emotional_tags.sql

CREATE TABLE IF NOT EXISTS game.emotional_tags (
    id BIGSERIAL PRIMARY KEY,
    save_slot_id UUID NOT NULL REFERENCES game.save_slots(id) ON DELETE CASCADE,
    survivor_id UUID NOT NULL REFERENCES game.survivors(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    sentiment_score SMALLINT NOT NULL DEFAULT 0 CHECK (sentiment_score BETWEEN -100 AND 100),
    promise_made BOOLEAN NOT NULL DEFAULT FALSE,
    promise_text TEXT,
    context JSONB DEFAULT '{}',
    game_day INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_tags_lookup
    ON game.emotional_tags (save_slot_id, survivor_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON game.emotional_tags TO thecamp_api;
GRANT USAGE, SELECT ON SEQUENCE game.emotional_tags_id_seq TO thecamp_api;

ALTER TABLE game.emotional_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY emotional_tags_policy ON game.emotional_tags
    USING (save_slot_id::text = current_setting('app.current_save_slot_id', true));
