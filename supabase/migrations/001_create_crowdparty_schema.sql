-- ====================================================================
-- CrowdParty PostgreSQL Schema (Supabase Migrations)
-- Authoritative multiplayer party game platform
-- ====================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Rooms Table (Lobby and Active Sessions)
CREATE TABLE IF NOT EXISTS rooms (
    code VARCHAR(6) PRIMARY KEY,
    host_id VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'IN_GAME', 'EXPIRED', 'CLOSED')),
    selected_game_id VARCHAR(32) NOT NULL DEFAULT 'draw-and-guess',
    settings JSONB NOT NULL DEFAULT '{"maxPlayers": 12, "isPrivate": false, "allowLateJoin": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours')
);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);

-- 2. Game Sessions History (Leaderboards & Archival)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(6) REFERENCES rooms(code) ON DELETE SET NULL,
    game_id VARCHAR(32) NOT NULL,
    total_rounds INT NOT NULL DEFAULT 1,
    winner_ids TEXT[] NOT NULL DEFAULT '{}',
    final_standings JSONB NOT NULL DEFAULT '[]'::jsonb,
    statistics JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed_at ON game_sessions(completed_at DESC);

-- 3. Player Profiles & Overall Stats (Optional persistent accounts or persistent nicknames)
CREATE TABLE IF NOT EXISTS player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(64) UNIQUE NOT NULL,
    nickname VARCHAR(32) NOT NULL,
    avatar VARCHAR(32) NOT NULL DEFAULT 'cat',
    total_games_played INT NOT NULL DEFAULT 0,
    total_wins INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_profiles_session_token ON player_profiles(session_token);

-- 4. User Moderation and Abuse Reports
CREATE TABLE IF NOT EXISTS abusive_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(6) NOT NULL,
    reporter_id VARCHAR(64) NOT NULL,
    reported_id VARCHAR(64) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    text_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abusive_reports_room_code ON abusive_reports(room_code);

-- 5. Row Level Security Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE abusive_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read of active public rooms
CREATE POLICY "Public rooms are readable by anyone"
    ON rooms FOR SELECT
    USING (status != 'EXPIRED');

-- Allow game sessions to be read for leaderboards
CREATE POLICY "Game sessions are viewable by all"
    ON game_sessions FOR SELECT
    USING (true);

-- Allow server service role to perform all operations
CREATE POLICY "Service role full access rooms"
    ON rooms FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access game_sessions"
    ON game_sessions FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access player_profiles"
    ON player_profiles FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access abusive_reports"
    ON abusive_reports FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Periodic Cleanup Routine for Expired Rooms
CREATE OR REPLACE FUNCTION clean_expired_rooms()
RETURNS void AS $$
BEGIN
    UPDATE rooms 
    SET status = 'EXPIRED'
    WHERE expires_at < NOW() AND status != 'EXPIRED';
END;
$$ LANGUAGE plpgsql;
