-- Phase 26: Seed Stock Market Basics Course
-- Ensures the course exists for the slug 'stock-market-basics'

-- 1. Insert Course
INSERT INTO courses (title, slug, description, thumbnail_url, tier, difficulty, topic, estimated_hours, is_active, order_index)
VALUES (
    'Stock Market Basics',
    'stock-market-basics',
    'A comprehensive guide for beginners to understand how the stock market works, from key terms to executing your first trade. Build a solid foundation for your trading journey.',
    'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop',
    'free',
    'beginner',
    'Basics',
    5,
    true,
    1
)
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    is_active = true;

-- 2. Insert Lessons for this Course (Get course ID first)
DO $$
DECLARE
    v_course_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE slug = 'stock-market-basics';

    -- Lesson 1: Introduction
    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES (
        v_course_id,
        'What is the Stock Market?',
        'what-is-stock-market',
        'Understanding the fundamental concept of equity ownership and how exchanges work.',
        'https://www.youtube.com/embed/p7HKvqRI_Bo', -- Placeholder
        600,
        1,
        true
    ) ON CONFLICT (course_id, slug) DO NOTHING;

    -- Lesson 2: Key Terms
    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES (
        v_course_id,
        'Key Terms: Bull, Bear, and Volatility',
        'key-terms',
        'Learn the essential vocabulary every trader needs to know.',
        'https://www.youtube.com/embed/p7HKvqRI_Bo',
        900,
        2,
        false
    ) ON CONFLICT (course_id, slug) DO NOTHING;

    -- Lesson 3: Types of Orders
    INSERT INTO lessons (course_id, title, slug, description, video_url, duration_seconds, order_index, is_free_preview)
    VALUES (
        v_course_id,
        'Market vs Limit Orders',
        'market-limit-orders',
        'How to enter and exit trades using different order types.',
        'https://www.youtube.com/embed/p7HKvqRI_Bo',
        1200,
        3,
        false
    ) ON CONFLICT (course_id, slug) DO NOTHING;
END $$;
