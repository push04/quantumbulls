-- ============================================================
-- Migration 024: Seed data for Calendar & Testimonials sections
-- Run this in Supabase SQL Editor if your tables are empty
-- ============================================================

-- ----------------------------------------------------------------
-- 1. TESTIMONIALS — seed sample approved testimonials
--    (Only run if you have NO testimonials yet in your DB)
--    The HomeTestimonials section on the home page fetches from
--    this table (status = 'approved', latest 3).
-- ----------------------------------------------------------------

INSERT INTO public.testimonials (author_name, author_title, content, rating, status, featured)
VALUES
  (
    'Rahul Sharma',
    'Full-Time Trader, Mumbai',
    'Quantum Bull completely changed how I approach the markets. The structured courses and live sessions gave me a repeatable edge I never had before. Went from inconsistent losses to 3x returns in 6 months.',
    5, 'approved', true
  ),
  (
    'Priya Mehta',
    'Options Trader, Bangalore',
    'The mentor''s risk management framework alone was worth the entire subscription. I used to blow up my account every few months — that stopped the day I joined. Best investment I''ve made.',
    5, 'approved', true
  ),
  (
    'Amit Verma',
    'Swing Trader, Delhi',
    'I had tried 4 other trading courses before this. Quantum Bull is the only one that actually teaches you to think, not just follow signals. The community is incredibly supportive too.',
    5, 'approved', false
  ),
  (
    'Sneha Rao',
    'Equity Investor, Hyderabad',
    'Joined for the price action course, stayed for the live sessions. The calendar feature makes it so easy to plan my week around the market. Highly recommend for serious traders.',
    5, 'approved', false
  )
ON CONFLICT DO NOTHING;


-- ----------------------------------------------------------------
-- 2. LIVE SESSIONS — seed upcoming sessions for the Calendar page
--    (Only run if you have NO live_sessions scheduled)
--    The /calendar page and /live page fetch from this table.
-- ----------------------------------------------------------------

-- NOTE: Replace dates below with future dates relative to when you run this.
-- Current example uses dates from 2026-03-20 onwards.

INSERT INTO public.live_sessions (
    title, description, scheduled_at, duration_minutes,
    stream_platform, stream_url, status, min_tier,
    recording_published, host_name
)
VALUES
  (
    'Morning Market Outlook — Nifty & BankNifty Analysis',
    'Daily pre-market session covering key levels, setups, and what to watch for the trading day.',
    '2026-03-20 09:00:00+05:30', 45,
    'youtube', NULL, 'scheduled', 'free',
    false, 'Quantum Bull Mentor'
  ),
  (
    'Options Strategy Masterclass: Selling Premium',
    'Deep dive into credit spreads, iron condors, and how to profit from time decay in sideways markets.',
    '2026-03-22 11:00:00+05:30', 90,
    'zoom', NULL, 'scheduled', 'basic',
    false, 'Quantum Bull Mentor'
  ),
  (
    'Live Trading Session — Real-Time Intraday Calls',
    'Watch the mentor trade live with full commentary on entry, exit, stop-loss, and position sizing.',
    '2026-03-25 09:15:00+05:30', 120,
    'youtube', NULL, 'scheduled', 'medium',
    false, 'Quantum Bull Mentor'
  ),
  (
    'Advanced: Reading Institutional Order Flow',
    'Exclusive session for Advanced members. Learn how to identify smart money activity using volume and price.',
    '2026-03-27 18:00:00+05:30', 90,
    'zoom', NULL, 'scheduled', 'advanced',
    false, 'Quantum Bull Mentor'
  ),
  (
    'Weekend Q&A — Ask the Mentor Anything',
    'Open Q&A session. Bring your charts, your doubts, and your setups. All levels welcome.',
    '2026-03-29 10:00:00+05:30', 60,
    'youtube', NULL, 'scheduled', 'free',
    false, 'Quantum Bull Mentor'
  ),
  (
    'Monthly Review: March Market Recap & April Outlook',
    'Full month in review — what worked, what didn''t, and the macro setup going into April.',
    '2026-03-31 17:00:00+05:30', 75,
    'youtube', NULL, 'scheduled', 'basic',
    false, 'Quantum Bull Mentor'
  )
ON CONFLICT DO NOTHING;


-- ----------------------------------------------------------------
-- 3. VERIFY — quick check queries (run to confirm data loaded)
-- ----------------------------------------------------------------

-- SELECT count(*) FROM public.testimonials WHERE status = 'approved';
-- SELECT count(*) FROM public.live_sessions WHERE status != 'cancelled';
