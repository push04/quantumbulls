-- Update forum categories to match BabyPips-style trading forum
DELETE FROM forum_categories;

INSERT INTO forum_categories (name, slug, description, color, sub_tags, display_order) VALUES
    ('Beginner Questions', 'beginner-questions', 'For newcomers asking basic trading questions and getting started guidance.', '#3B82F6', ARRAY['Getting Started', 'Basics', 'First Steps'], 1),
    ('Trading Discussion', 'trading-discussion', 'General forex and trading market discussion. Share ideas and learn from others.', '#10B981', ARRAY['Currencies', 'Chart Art', 'News and Economy', 'Risk Management', 'Trade Journals', 'Prop Firms', 'Trading Lifestyle', 'Binary Options'], 2),
    ('Trading Systems', 'trading-systems', 'Discussing specific strategies and trading systems. Share your setups and get feedback.', '#8B5CF6', ARRAY['Strategies', 'Indicators', 'EA Trading', 'Automated'], 3),
    ('Chart Analysis', 'chart-analysis', 'Candlesticks, chart patterns, and price action analysis. Post your charts!', '#F59E0B', ARRAY['Technical Analysis', 'Price Action', 'Candlesticks', 'Patterns'], 4),
    ('Trading Psychology', 'trading-psychology', 'Mindset, emotions, and discipline in trading. Master your mental game.', '#EC4899', ARRAY['Mindset', 'Emotions', 'Discipline', 'Journaling'], 5),
    ('News & Economy', 'news-economy', 'Market news, economic events, and fundamental analysis discussion.', '#14B8A6', ARRAY['Forex News', 'Central Banks', 'Economic Data', 'Fundamentals'], 6),
    ('Risk Management', 'risk-management', 'Position sizing, money management, and risk control practices.', '#EF4444', ARRAY['Position Sizing', 'Money Management', 'Risk Control', 'Portfolio'], 7),
    ('Prop Firms', 'prop-firms', 'Discussion about proprietary trading firms, challenges, and funded accounts.', '#6366F1', ARRAY['Funded Accounts', 'Challenges', 'Evaluation', 'Payouts'], 8),
    ('Crypto & Digital Assets', 'crypto-assets', 'Cryptocurrency trading and digital assets discussion.', '#F97316', ARRAY['Bitcoin', 'Altcoins', 'DeFi', 'NFTs'], 9),
    ('Global Markets', 'global-markets', 'Stocks, commodities, bonds and markets beyond forex.', '#0EA5E9', ARRAY['Stocks', 'Commodities', 'Bonds', 'Indices'], 10),
    ('Introduce Yourself', 'introduce-yourself', 'New member introductions. Say hello and tell us about your journey!', '#84CC16', ARRAY['New Members', 'Hello'], 11),
    ('The Lobby', 'the-lobby', 'Off-topic and casual conversation. Take a break and chat with fellow traders.', '#6B7280', ARRAY['Off-Topic', 'Casual', 'Fun']);

-- Add color column to forum_categories if not exists
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#2EBD59';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT '{}';
