-- Database Seed Script: Admin Setup
-- Run this AFTER supabase_schema.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Find or create the admin auth user
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@uni.edu';

  IF v_admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated', 'authenticated',
      'admin@uni.edu',
      crypt('Admin@2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(), now(), '', '', '', ''
    )
    RETURNING id INTO v_admin_id;
  END IF;

  -- Remove any stale admin profile with a different ID (from old runs)
  DELETE FROM public.profiles
  WHERE university_id = 'admin' AND id <> v_admin_id;

  -- Upsert the admin profile with matching id
  INSERT INTO public.profiles (id, university_id, name_ar, name_fr, role, status)
  VALUES (v_admin_id, 'admin', 'المدير العام', 'Administrateur', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET
    university_id = 'admin',
    name_ar = 'المدير العام',
    name_fr = 'Administrateur',
    role = 'admin',
    status = 'active';
END $$;
