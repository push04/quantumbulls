-- Phase 11: Live Learning Experiences
-- Database schema for live sessions, registrations, chat, polls, and analytics

---------------------------------------------------
-- LIVE SESSIONS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    stream_url TEXT,
    stream_platform VARCHAR(50) DEFAULT 'youtube', -- youtube, zoom, streamyard
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, live, ended, cancelled
    min_tier VARCHAR(20) NOT NULL DEFAULT 'free', -- free, basic, medium, advanced
    max_attendees INTEGER, -- NULL means unlimited
    recording_url TEXT,
    recording_published BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    host_name VARCHAR(100),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    peak_viewers INTEGER DEFAULT 0,
    total_unique_viewers INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view published sessions, admins can manage
CREATE POLICY "Anyone can view sessions" ON live_sessions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage sessions" ON live_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

---------------------------------------------------
-- SESSION REGISTRATIONS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    watch_duration_seconds INTEGER DEFAULT 0,
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_1h_sent BOOLEAN DEFAULT FALSE,
    UNIQUE(session_id, user_id)
);

ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON session_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for sessions" ON session_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON session_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

---------------------------------------------------
-- SESSION CHAT TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS session_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_question BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

ALTER TABLE session_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view session chat" ON session_chat
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can send messages" ON session_chat
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON session_chat
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage chat" ON session_chat
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

---------------------------------------------------
-- SESSION POLLS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS session_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- ["Option A", "Option B", "Option C"]
    is_active BOOLEAN DEFAULT TRUE,
    show_results BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

ALTER TABLE session_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls" ON session_polls
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage polls" ON session_polls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

---------------------------------------------------
-- POLL VOTES TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES session_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes" ON poll_votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can vote" ON poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all votes" ON poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

---------------------------------------------------
-- INDEXES FOR PERFORMANCE
---------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled_at ON live_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_sessions_min_tier ON live_sessions(min_tier);

CREATE INDEX IF NOT EXISTS idx_session_registrations_session ON session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_user ON session_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_session_chat_session ON session_chat(session_id);
CREATE INDEX IF NOT EXISTS idx_session_chat_created ON session_chat(created_at);

CREATE INDEX IF NOT EXISTS idx_session_polls_session ON session_polls(session_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);

---------------------------------------------------
-- FUNCTIONS
---------------------------------------------------

-- Function to get poll results
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE(option_index INTEGER, vote_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT pv.option_index, COUNT(*) as vote_count
    FROM poll_votes pv
    WHERE pv.poll_id = poll_uuid
    GROUP BY pv.option_index
    ORDER BY pv.option_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session viewer count
CREATE OR REPLACE FUNCTION get_session_viewer_count(session_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)::INTEGER
        FROM session_registrations
        WHERE session_id = session_uuid
        AND attended = TRUE
        AND (left_at IS NULL OR left_at > NOW() - INTERVAL '5 minutes')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---------------------------------------------------
-- ENABLE REALTIME FOR CHAT
---------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE session_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE session_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
