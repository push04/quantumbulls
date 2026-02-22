# Quantum Bull - Technical Documentation

## Overview

Quantum Bull is a comprehensive trading education platform built with Next.js 15, Supabase, and Tailwind CSS. The platform provides structured trading education, community forums, market analysis, and live trading sessions.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4.0 |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Storage | Supabase Storage (Videos & Images) |
| Payments | Razorpay Integration |
| Icons | Lucide React |
| Fonts | Inter |

---

## Project Structure

```
quantum-bull/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/
│   │   │   └── callback/
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── courses/
│   │   │   ├── news/
│   │   │   ├── analysis/
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── testimonials/
│   │   │   ├── settings/
│   │   │   └── security/
│   │   ├── dashboard/         # User dashboard
│   │   │   ├── courses/
│   │   │   ├── live/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   ├── community/         # Forum pages
│   │   │   ├── [categorySlug]/
│   │   │   └── thread/[threadId]/
│   │   ├── api/              # API routes
│   │   │   └── payment/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Icon.tsx       # Icon system
│   │   │   └── Loading.tsx   # Loading states
│   │   ├── content/          # Content components
│   │   │   ├── SmartVideoPlayer.tsx
│   │   │   ├── SimpleVideoPlayer.tsx
│   │   │   └── CustomVideoPlayer.tsx
│   │   ├── admin/            # Admin components
│   │   │   ├── VideoUpload.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── AlertNotifications.tsx
│   │   ├── payment/          # Payment components
│   │   └── Navbar.tsx, Footer.tsx, Hero.tsx, Features.tsx
│   └── lib/                   # Utilities
│       ├── supabase/         # Supabase clients & helpers
│       └── learning/          # Learning utilities
├── database/                  # SQL migrations & setup
│   ├── COMPLETE_SETUP.sql    # Full database setup
│   ├── FINAL_SETUP.sql        # Previous setup
│   └── migrations/           # Version migrations
├── docs/                      # Documentation
├── public/                   # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

### Core Tables

#### `profiles`
User profile information with extended data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID (FK to auth.users) |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile image URL |
| role | TEXT | User role (user/admin) |
| reputation_score | INTEGER | Forum reputation |
| forum_post_count | INTEGER | Total forum posts |
| is_trusted_member | BOOLEAN | Trusted community member |

#### `courses`
Trading courses with tiered access.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Course ID |
| title | TEXT | Course title |
| slug | TEXT | URL slug |
| description | TEXT | Course description |
| thumbnail_url | TEXT | Cover image |
| difficulty | TEXT | beginner/intermediate/advanced |
| tier | TEXT | Access tier (free/basic/pro/mentor) |
| estimated_hours | INTEGER | Course duration |
| is_active | BOOLEAN | Course visibility |
| order_index | INTEGER | Display order |
| price | INTEGER | Course price |

#### `lessons`
Individual lessons within courses.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Lesson ID |
| course_id | UUID | Parent course |
| title | TEXT | Lesson title |
| slug | TEXT | URL slug |
| description | TEXT | Lesson description |
| content | TEXT | Lesson content |
| video_url | TEXT | Video URL (Supabase/YouTube) |
| duration_seconds | INTEGER | Video duration |
| order_index | INTEGER | Display order |
| is_free_preview | BOOLEAN | Preview availability |

#### `forum_categories`
Forum topic categories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Category ID |
| name | TEXT | Category name |
| slug | TEXT | URL slug |
| description | TEXT | Category description |
| color | VARCHAR | Category color |
| sub_tags | TEXT[] | Sub-tags |
| display_order | INTEGER | Sort order |
| is_active | BOOLEAN | Visibility |

#### `forum_threads`
Forum discussion threads.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Thread ID |
| category_id | UUID | Forum category |
| author_id | UUID | Thread author |
| title | TEXT | Thread title |
| content | TEXT | Thread content |
| reply_count | INTEGER | Reply count |
| view_count | INTEGER | View count |
| is_pinned | BOOLEAN | Pinned status |
| is_locked | BOOLEAN | Locked status |
| is_deleted | BOOLEAN | Soft delete |
| created_at | TIMESTAMP | Creation time |
| last_activity_at | TIMESTAMP | Last activity |

#### `forum_replies`
Thread replies.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Reply ID |
| thread_id | UUID | Parent thread |
| author_id | UUID | Reply author |
| content | TEXT | Reply content |
| is_deleted | BOOLEAN | Soft delete |
| created_at | TIMESTAMP | Creation time |

#### `subscription_plans`
Pricing plans.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Plan ID |
| name | TEXT | Plan name |
| price | INTEGER | Plan price |
| interval | TEXT | billing period |
| description | TEXT | Plan description |
| tier | TEXT | Tier identifier |
| features | TEXT[] | Plan features |
| is_popular | BOOLEAN | Popular badge |
| cta_text | TEXT | CTA button text |

#### `market_news`
Market news articles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | News ID |
| title | TEXT | News title |
| summary | TEXT | Brief summary |
| content | TEXT | Full content |
| source | TEXT | News source |
| image_url | TEXT | Cover image |
| published_at | TIMESTAMP | Publish date |
| is_active | BOOLEAN | Visibility |

#### `success_stories`
Student success stories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Story ID |
| name | TEXT | Student name |
| story | TEXT | Full story |
| before_story | TEXT | Before quantum bull |
| after_story | TEXT | After quantum bull |
| image_url | TEXT | Student photo |
| status | TEXT | pending/approved/rejected |

#### `testimonials`
User testimonials.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Testimonial ID |
| name | TEXT | User name |
| content | TEXT | Testimonial |
| rating | INTEGER | Star rating (1-5) |
| status | TEXT | pending/approved/rejected |
| featured | BOOLEAN | Featured display |

---

## Design System

### Brand Colors

```css
:root {
  --bullish: #2EBD59;       /* Primary green */
  --bullish-hover: #26a34d; /* Hover state */
  --bearish: #DC2626;       /* Red for losses */
  
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  
  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  /* Borders */
  --border: #e2e8f0;
  --border-hover: #cbd5e1;
}
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Heading Sizes**: 3xl to 6xl for hero, lg to xl for sections
- **Body**: 16px base, 1.6 line-height

### Component Library

Located in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| Icon | Lucide React icon wrapper with custom names |
| Loading | Loading spinner and skeleton components |

### Animations

Custom animations in `globals.css`:
- `fadeInUp` - Fade in with upward motion
- `fadeIn` - Simple fade in
- `float` - Floating element effect
- `pulseGlow` - Pulsing glow effect
- `shimmer` - Loading shimmer effect
- `buttonPress` - Button press feedback

---

## Features

### User Features

1. **Course Learning**
   - Browse and enroll in courses
   - Watch video lessons (YouTube/Supabase)
   - Track progress
   - Mark lessons complete

2. **Community Forum**
   - Browse categories
   - Create threads
   - Reply to discussions
   - Upvote/downvote posts

3. **Market Content**
   - Daily market news
   - Technical analysis
   - Success stories
   - Testimonials

4. **User Dashboard**
   - View enrolled courses
   - Track learning progress
   - Access live sessions
   - Manage account settings

### Admin Features

1. **Content Management**
   - Create/edit courses and lessons
   - Upload videos
   - Manage news articles
   - Post market analysis

2. **User Management**
   - View all users
   - Manage roles
   - View orders

3. **Community Moderation**
   - Manage forum categories
   - Moderate threads/replies

---

## API Routes

### Payment API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/order` | POST | Create payment order |
| `/api/payment/verify` | POST | Verify payment |
| `/api/payment/manual` | POST | Manual payment |

### Authentication

Uses Supabase Auth with following flows:
- Email/password signup/signin
- Magic link
- Email verification
- Password reset

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Razorpay account (for payments)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd quantum-bull

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Database Setup

1. Create a new Supabase project
2. Run `database/COMPLETE_SETUP.sql` in the Supabase SQL Editor
3. Configure storage buckets (videos, images)
4. Set up authentication providers

---

## Build & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

---

## Security Considerations

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Public read for content tables
   - Authenticated write for user content
   - Admin restrictions for management

2. **Storage Policies**
   - Videos/images: Public read
   - Authenticated upload
   - Admin management

3. **API Security**
   - Server-side payment verification
   - Server-side session checks
   - Input validation

---

## Troubleshooting

### Common Issues

1. **Video not playing**
   - Check storage bucket policies
   - Verify video URL format
   - Check browser console for errors

2. **Authentication issues**
   - Verify Supabase URL and keys
   - Check email confirmations
   - Review auth settings in Supabase

3. **Payment failures**
   - Verify Razorpay keys
   - Check webhook configuration
   - Review order creation logs

---

## License

Proprietary - All rights reserved

---

## Support

For technical support, contact: support@quantumbull.in
