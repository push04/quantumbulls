-- Safe Admin Creation Script (No ON CONFLICT dependencies)
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
  v_email REFCURSOR;
BEGIN
  -- 1. Handle auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@quantumbull.com';

  IF v_user_id IS NULL THEN
    -- Create new user
    v_user_id := uuid_generate_v4();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
      'admin@quantumbull.com', crypt('quantumbulls', gen_salt('bf')), 
      now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Quantum Admin"}', 
      now(), now(), '', ''
    );
  ELSE
    -- Update existing user password
    UPDATE auth.users 
    SET encrypted_password = crypt('quantumbulls', gen_salt('bf')),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 2. Handle public.profiles
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    UPDATE public.profiles
    SET role = 'admin',
        full_name = 'Quantum Admin'
    WHERE id = v_user_id;
  ELSE
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (v_user_id, 'admin', 'Quantum Admin');
  END IF;

  RAISE NOTICE 'Admin user processed successfully with ID: %', v_user_id;
END $$;
