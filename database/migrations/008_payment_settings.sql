-- Phase 15: Payment Settings (Razorpay)
-- Run this in Supabase SQL Editor

-- Insert default Razorpay settings into system_settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('razorpay_key_id', 'rzp_test_placeholder', 'Razorpay Key ID (Public)'),
    ('razorpay_key_secret', 'secret_placeholder', 'Razorpay Key Secret (Private)'),
    ('razorpay_currency', 'INR', 'Default Currency (INR, USD, etc.)')
ON CONFLICT (key) DO NOTHING;

-- Create Orders table to track payments
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    amount INTEGER NOT NULL, -- in smallest currency unit (e.g., paise)
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending', -- pending, paid, failed
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for orders
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON payment_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON payment_orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Service role policies for webhooks/updates (handled in code via service key usually, or explicit logic)
