const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnnskpuvsnxizqwjhvqo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUxOTA2NCwiZXhwIjoyMDg2MDk1MDY0fQ.dQsmtTWIUPkFkAjlPZAPodOOFwVmT9UgMTFJLFtzxe8';

const supabase = createClient(supabaseUrl, serviceKey);

async function insertData() {
    console.log('Inserting additional seed data...\n');

    // Add more courses
    const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .insert([
            {
                title: 'Technical Analysis Mastery',
                slug: 'technical-analysis-mastery',
                description: 'Master technical analysis indicators and chart patterns',
                difficulty: 'intermediate',
                tier: 'pro',
                is_active: true,
                order_index: 2,
                thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
            },
            {
                title: 'Options Trading Strategies',
                slug: 'options-trading-strategies',
                description: 'Learn profitable options trading strategies',
                difficulty: 'advanced',
                tier: 'pro',
                is_active: true,
                order_index: 3,
                thumbnail_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800'
            },
            {
                title: 'Risk Management Fundamentals',
                slug: 'risk-management-fundamentals',
                description: 'Protect your capital with proven risk management',
                difficulty: 'beginner',
                tier: 'free',
                is_active: true,
                order_index: 4,
                thumbnail_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800'
            }
        ])
        .select();

    if (coursesError) {
        console.error('Courses error:', coursesError.message);
    } else {
        console.log('✅ Added courses:', courses?.length || 0);
    }

    // Add success stories
    const { data: stories, error: storiesError } = await supabase
        .from('success_stories')
        .insert([
            {
                title: 'Rahul Sharma - Pro Trader',
                content: 'After completing the Technical Analysis course, I doubled my portfolio in 6 months. The community support is amazing!',
                before_story: 'Started with no trading experience',
                after_story: 'Doubled portfolio in 6 months',
                image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                status: 'approved'
            },
            {
                title: 'Priya Patel - Full-Time Trader',
                content: 'Quantum Bull courses gave me the confidence to trade full-time. Now I earn more than my previous job.',
                before_story: 'Working 9-5 job, no trading knowledge',
                after_story: 'Now earning 5x previous salary from trading',
                image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                status: 'approved'
            },
            {
                title: 'Amit Kumar - Swing Trader',
                content: 'The options strategies course is worth every penny. Learned to hedge my positions effectively.',
                before_story: 'Struggled with risk management',
                after_story: 'Successfully hedging positions consistently',
                image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                status: 'approved'
            }
        ])
        .select();

    if (storiesError) {
        console.error('Success stories error:', storiesError.message);
    } else {
        console.log('✅ Added success stories:', stories?.length || 0);
    }

    // Add testimonials
    const { data: testimonials, error: testimonialsError } = await supabase
        .from('testimonials')
        .insert([
            {
                author_name: 'Vikram Singh',
                author_title: 'Day Trader',
                content: 'Best trading education platform in India. The live sessions are incredibly helpful.',
                rating: 5,
                status: 'approved'
            },
            {
                author_name: 'Sneha Reddy',
                author_title: 'Beginner',
                content: 'Started from zero knowledge. Now I understand markets better than ever. Highly recommended!',
                rating: 5,
                status: 'approved'
            },
            {
                author_name: 'Raj Malhotra',
                author_title: 'Investor',
                content: 'The technical analysis course transformed my investing approach. Great content quality.',
                rating: 4,
                status: 'approved'
            }
        ])
        .select();

    if (testimonialsError) {
        console.error('Testimonials error:', testimonialsError.message);
    } else {
        console.log('✅ Added testimonials:', testimonials?.length || 0);
    }

    // Add system settings
    const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .upsert([
            { key: 'site_tagline', value: 'Master the Markets with Quantum Bull' },
            { key: 'facebook_url', value: 'https://facebook.com/quantumbull' },
            { key: 'twitter_url', value: 'https://twitter.com/quantumbull' },
            { key: 'youtube_url', value: 'https://youtube.com/quantumbull' },
            { key: 'telegram_url', value: 'https://telegram.me/quantumbull' },
            { key: 'support_phone', value: '+91 98765 43210' }
        ], { onConflict: 'key' })
        .select();

    if (settingsError) {
        console.error('Settings error:', settingsError.message);
    } else {
        console.log('✅ Updated system settings');
    }

    console.log('\n--- Seed data insertion complete! ---\n');
}

insertData().catch(console.error);
