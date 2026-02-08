-- ==========================================
-- REALISTIC DATA SEED
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. SEED SUBSCRIPTION PLANS (Ensure they exist)
INSERT INTO subscription_plans (name, price, interval, features, is_popular, tier, cta_text, display_order)
VALUES 
    ('Basic', 0, 'month', ARRAY['Community Access', 'Basic Courses', 'Daily Market News'], false, 'free', 'Get Started', 1),
    ('Pro Trader', 999, 'month', ARRAY['All Basic Features', 'Advanced Courses', 'Live Trading Sessions', 'Priority Support'], true, 'pro', 'Start Pro Trial', 2),
    ('Mentorship', 4999, 'month', ARRAY['All Pro Features', '1-on-1 Mentoring', 'Portfolio Review', 'Direct WhatsApp Access'], false, 'mentor', 'Apply Now', 3)
ON CONFLICT (tier) DO NOTHING;

-- 2. SEED MARKET NEWS
INSERT INTO market_news (title, summary, source, url, published_at)
VALUES 
    (
        'RBI Keeps Repo Rate Unchanged at 6.5%', 
        'The Reserve Bank of India has decided to maintain the status quo on policy rates, citing easing inflation trends.', 
        'Economic Times', 
        'https://economictimes.indiatimes.com',
        NOW() - INTERVAL '2 hours'
    ),
    (
        'Nifty Hits All-Time High Crossing 22,500', 
        'Bullish momentum continues in Indian markets led by banking and IT stocks.', 
        'Moneycontrol', 
        'https://www.moneycontrol.com',
        NOW() - INTERVAL '5 hours'
    ),
    (
        'Gold Prices Surge Amidst Global Geopolitical Tensions', 
        'Safe-haven demand pushes gold prices to new record highs as uncertainty looms.', 
        'Bloomberg', 
        'https://www.bloomberg.com',
        NOW() - INTERVAL '1 day'
    ),
    (
        'Tech Mahindra Q3 Results: Profit Jumps 15%', 
        'IT major reports better-than-expected quarterly numbers driven by deal wins.', 
        'CNBC TV18', 
        'https://www.cnbctv18.com',
        NOW() - INTERVAL '1 day 4 hours'
    ),
    (
        'SEBI Proposes New Rules for F&O Trading', 
        'The regulator aims to curb speculative trading by retail investors with tighter margin requirements.', 
        'LiveMint', 
        'https://www.livemint.com',
        NOW() - INTERVAL '2 days'
    );

-- 3. SEED MARKET ANALYSIS (Requires an author, tries to pick one)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM auth.users LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO market_analysis (title, summary, content, author_id, image_url, is_premium, published_at)
        VALUES 
            (
                'Nifty Weekly Outlook: Consolidation or Breakout?', 
                'Analyzing the key support and resistance levels for the upcoming week.', 
                '## Market Context
The Nifty 50 index has shown remarkable resilience...

### Key Levels
- **Support**: 22,200
- **Resistance**: 22,600

## Strategy
Traders should look for buying opportunities on dips near support levels...',
                admin_id,
                'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1000',
                false,
                NOW() - INTERVAL '1 day'
            ),
            (
                'Bank Nifty Strategy for Tomorrow', 
                'Detailed setup for Bank Nifty expiry focusing on option chain analysis.', 
                '## Option Chain Analysis
The highest Open Interest is at 48,000 Call and 47,500 Put...

### Trade Plan
- Long above 48,100
- Short below 47,400',
                admin_id,
                'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=1000',
                true,
                NOW() - INTERVAL '6 hours'
            );
    END IF;
END $$;

-- 4. SEED COURSES & LESSONS
DO $$
DECLARE
    course_id UUID;
BEGIN
    -- Course 1: Stock Market Basics (Free)
    INSERT INTO courses (title, slug, description, thumbnail_url, tier, difficulty, topic, estimated_hours)
    VALUES (
        'Stock Market Basics', 
        'stock-market-basics', 
        'A comprehensive guide for beginners to understand how the stock market works.', 
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000',
        'free', 
        'beginner', 
        'Fundamentals', 
        2
    ) RETURNING id INTO course_id;

    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES 
        (course_id, 'What is the Stock Market?', 'what-is-stock-market', 'Introduction to exchanges, shares, and IPOs.', 'https://www.youtube.com/watch?v=p7HKvqRI_Bo', 600, 1, true),
        (course_id, 'How to Open a Demat Account', 'open-demat-account', 'Step-by-step guide to opening your first trading account.', 'https://www.youtube.com/watch?v=J3s4H3d4G_Y', 450, 2, true),
        (course_id, 'Understanding Market Orders', 'market-orders', 'Limit vs Market vs Stop Loss orders explained.', 'https://www.youtube.com/watch?v=ZCFkWDdmXG8', 720, 3, false);

    -- Course 2: Technical Analysis Masterclass (Pro)
    INSERT INTO courses (title, slug, description, thumbnail_url, tier, difficulty, topic, estimated_hours)
    VALUES (
        'Technical Analysis Masterclass', 
        'technical-analysis-masterclass', 
        'Master the art of reading charts, indicators, and price action.', 
        'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1000',
        'pro', 
        'intermediate', 
        'Technical Analysis', 
        10
    ) RETURNING id INTO course_id;

    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES 
        (course_id, 'Candlestick Patterns', 'candlestick-patterns', 'Learn to identify bullish and bearish reversal patterns.', 'https://www.youtube.com/watch?v=C35l887s1P4', 1200, 1, true),
        (course_id, 'Support and Resistance', 'support-resistance', 'How to draw and trade key levels.', 'https://www.youtube.com/watch?v=Blo50r1tGzE', 900, 2, false),
        (course_id, 'Moving Averages', 'moving-averages', 'Using SMA and EMA for trend identification.', 'https://www.youtube.com/watch?v=3nZ2F5j1k4k', 1100, 3, false),
        (course_id, 'RSI and MACD', 'rsi-macd', 'Momentum indicators explained.', 'https://www.youtube.com/watch?v=XyFzW1b6j2g', 1500, 4, false);

     -- Course 3: Advanced Options Trading (Mentor)
    INSERT INTO courses (title, slug, description, thumbnail_url, tier, difficulty, topic, estimated_hours)
    VALUES (
        'Advanced Options Strategies', 
        'advanced-options-strategies', 
        'Learn hedging, spreads, and adjustments for consistent income.', 
        'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=1000',
        'mentor', 
        'advanced', 
        'Options Trading', 
        15
    ) RETURNING id INTO course_id;
    
    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES 
        (course_id, 'Option Greeks', 'option-greeks', 'Delta, Gamma, Theta, Vega explained simply.', 'https://www.youtube.com/watch?v=yW6s_L4s3g4', 1800, 1, true),
        (course_id, 'Iron Condor Strategy', 'iron-condor', 'Non-directional strategy for range-bound markets.', 'https://www.youtube.com/watch?v=L1i_n5j1k4k', 2000, 2, false);

END $$;

-- 5. SEED LIVE SESSIONS (Requires user for host, optional)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM auth.users LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO live_sessions (title, description, scheduled_at, duration_minutes, status, min_tier, host_name, created_by)
        VALUES 
            (
                'Weekly Market Outlook - Live', 
                'Join us for a detailed breakdown of the upcoming week including Nifty and Bank Nifty levels.', 
                NOW() + INTERVAL '2 days', 
                60, 
                'scheduled', 
                'free', 
                'Pushkar Raj Thakur',
                admin_id
            ),
            (
                'Pro Traders Q&A Session', 
                'Exclusive Q&A session for Pro members. Ask your doubt about specific stocks.', 
                NOW() + INTERVAL '5 days', 
                90, 
                'scheduled', 
                'pro', 
                'Pushkar Raj Thakur',
                admin_id
            );
    END IF;
END $$;
