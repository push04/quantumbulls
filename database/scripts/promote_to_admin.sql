-- Promote an existing user to Admin
-- 1. Sign up a new user (e.g. admin2@quantumbull.com) via the App's Signup page.
-- 2. Run this script in Supabase SQL Editor.
-- 3. Replace 'admin2@quantumbull.com' with your actual email if different.

DO $$
DECLARE
  v_email TEXT := 'admin@quantumbull.com'; -- CHANGE THIS to your email
  v_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please Sign Up first via the app.', v_email;
  END IF;

  -- Update Profile
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    UPDATE public.profiles 
    SET role = 'admin', 
        full_name = 'Quantum Admin' 
    WHERE id = v_user_id;
  ELSE
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (v_user_id, 'admin', 'Quantum Admin');
  END IF;

  RAISE NOTICE 'SUCCESS: User % has been promoted to ADMIN.', v_email;
END $$;
