-- Create Admin User directly in SQL
-- Run this in Supabase SQL Editor

-- 1. Create User in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@quantumbull.com',
  crypt('quantumbulls', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Quantum Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Create/Update Profile in public.profiles
INSERT INTO public.profiles (id, role, full_name, email, subscription_tier)
SELECT id, 'admin', 'Quantum Admin', email, 'mentor'
FROM auth.users
WHERE email = 'admin@quantumbull.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    subscription_tier = 'mentor',
    full_name = 'Quantum Admin';

-- 3. Verify
SELECT * FROM public.profiles WHERE email = 'admin@quantumbull.com';
