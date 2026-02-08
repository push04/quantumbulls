-- Phase 14d: System Settings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Seed initial settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('site_name', 'Quantum Bull', 'Global site name'),
    ('maintenance_mode', 'false', 'Enable maintenance mode (true/false)'),
    ('registration_open', 'true', 'Allow new user registrations'),
    ('global_announcement', '', 'Banner text shown on all pages (empty to hide)')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/edit settings
CREATE POLICY "Admins manage settings" ON system_settings
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
