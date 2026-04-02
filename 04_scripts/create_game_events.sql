-- Create game_events table for unified game log
-- Run: psql -U aimph -d thecamp_db -f create_game_events.sql

CREATE TABLE IF NOT EXISTS game.game_events (
    id BIGSERIAL PRIMARY KEY,
    save_slot_id UUID NOT NULL REFERENCES game.save_slots(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('expedition', 'camp', 'social', 'decision', 'system')),
    text TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    game_day INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_events_lookup
    ON game.game_events (save_slot_id, game_day, created_at ASC);

GRANT SELECT, INSERT, DELETE ON game.game_events TO thecamp_api;
GRANT USAGE, SELECT ON SEQUENCE game.game_events_id_seq TO thecamp_api;

ALTER TABLE game.game_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY game_events_policy ON game.game_events
    USING (save_slot_id::text = current_setting('app.current_save_slot_id', true));
