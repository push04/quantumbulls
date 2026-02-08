-- Phase 12: Community & Social Learning
-- Database schema for forums, moderation, profiles, messaging, and study groups

---------------------------------------------------
-- FORUM CATEGORIES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO forum_categories (name, slug, description, icon, display_order) VALUES
    ('General Trading', 'general-trading', 'General discussions about trading and markets', '📈', 1),
    ('Technical Analysis', 'technical-analysis', 'Chart patterns, indicators, and technical setups', '📊', 2),
    ('Fundamental Analysis', 'fundamental-analysis', 'Company analysis, earnings, and financial statements', '📋', 3),
    ('Trading Psychology', 'trading-psychology', 'Mindset, discipline, and emotional management', '🧠', 4),
    ('Platform Feedback', 'platform-feedback', 'Suggestions and feedback for Quantum Bull', '💬', 5)
ON CONFLICT (slug) DO NOTHING;

---------------------------------------------------
-- FORUM THREADS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    vote_score INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active threads" ON forum_threads
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads" ON forum_threads
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage threads" ON forum_threads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

---------------------------------------------------
-- FORUM REPLIES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active replies" ON forum_replies
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies" ON forum_replies
    FOR UPDATE USING (auth.uid() = author_id);

---------------------------------------------------
-- FORUM VOTES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- 'thread' or 'reply'
    target_id UUID NOT NULL,
    vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes" ON forum_votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can vote" ON forum_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote" ON forum_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove vote" ON forum_votes
    FOR DELETE USING (auth.uid() = user_id);

---------------------------------------------------
-- USER REPUTATION
---------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forum_post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted_member BOOLEAN DEFAULT FALSE;

---------------------------------------------------
-- USER FOLLOWS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

---------------------------------------------------
-- PRIVATE MESSAGES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON user_messages
    FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Users can send messages" ON user_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update message read status" ON user_messages
    FOR UPDATE USING (auth.uid() = recipient_id);

---------------------------------------------------
-- USER BLOCKS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON user_blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block" ON user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);

---------------------------------------------------
-- NOTIFICATIONS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'mention', 'reply', 'follow', 'upvote', 'message'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    link TEXT,
    actor_id UUID REFERENCES auth.users(id),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications read" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

---------------------------------------------------
-- MODERATION: REPORTS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'thread', 'reply', 'message', 'user'
    content_id UUID,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON user_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view reports" ON user_reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

---------------------------------------------------
-- MODERATION: STRIKES & BANS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS user_strikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    issued_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    banned_until TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT FALSE,
    issued_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------
-- STUDY GROUPS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 20,
    member_count INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public groups" ON study_groups
    FOR SELECT USING (is_private = FALSE OR owner_id = auth.uid());

CREATE POLICY "Advanced users can create groups" ON study_groups
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pro', 'mentor'))
    );

CREATE TABLE IF NOT EXISTS study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group members" ON study_group_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM study_group_members sgm WHERE sgm.group_id = group_id AND sgm.user_id = auth.uid())
    );

CREATE TABLE IF NOT EXISTS study_group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------
-- INDEXES
---------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_target ON forum_votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON user_messages(recipient_id, created_at DESC);

---------------------------------------------------
-- REALTIME
---------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_messages;
