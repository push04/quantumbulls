-- Phase 16: Offline Payment Support
-- Run this in Supabase SQL Editor

-- Insert default Razorpay enabled setting
INSERT INTO system_settings (key, value, description)
VALUES 
    ('razorpay_enabled', 'true', 'Enable/Disable Razorpay Payment Gateway')
ON CONFLICT (key) DO NOTHING;
