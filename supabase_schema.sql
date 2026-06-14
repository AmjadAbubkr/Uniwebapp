-- King Faisal University Grade Management System Database Schema
-- Run this script in the Supabase SQL Editor to initialize the database tables and functions.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'dean', 'assistant_dean', 'teacher', 'student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('pending', 'active');
  END IF;
END$$;

-- Helper functions to avoid RLS recursion when checking user role/faculty
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.current_user_faculty_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT faculty_id FROM public.profiles WHERE id = auth.uid() $$;

-- 1. Create faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  university_id TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  role user_role NOT NULL,
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  department TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  section TEXT, -- e.g., Génie Informatique
  level TEXT, -- e.g., 4ème Année
  status account_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create pending_users table (staging area for CSV uploaded users awaiting activation)
CREATE TABLE IF NOT EXISTS pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  role user_role NOT NULL,
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  department TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  section TEXT,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  unit_name_ar TEXT NOT NULL, -- e.g., الوحدة الأولى
  unit_name_fr TEXT NOT NULL, -- e.g., Unité 1
  credits NUMERIC(4,2) NOT NULL CHECK (credits > 0),
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  section TEXT NOT NULL, -- matching student enrollment section
  level TEXT NOT NULL, -- matching student enrollment level
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create enrollments table for grades and subject linking
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  classwork NUMERIC(4,2) CHECK (classwork >= 0 AND classwork <= 20),
  exam_session_1 NUMERIC(4,2) CHECK (exam_session_1 >= 0 AND exam_session_1 <= 20),
  exam_session_2 NUMERIC(4,2) CHECK (exam_session_2 >= 0 AND exam_session_2 <= 20),
  subject_average NUMERIC(4,2), -- Automatically calculated
  credits_earned NUMERIC(4,2) DEFAULT 0.00, -- Automatically calculated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, subject_id)
);

-- 6. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE, -- Null for global admin posts
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE, -- Null for admin/dean posts
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================
-- AUTOMATIC PROFILE CREATION FROM AUTH.USERS & STAGING
-- ===================================================

-- Trigger function to handle new auth user signups
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_uni_id TEXT;
  v_pending RECORD;
BEGIN
  -- Extract university ID from email (e.g. "20260001@uni.edu" -> "20260001")
  v_uni_id := split_part(NEW.email, '@', 1);

  -- Check if this user was pre-registered in pending_users by a Dean
  SELECT * INTO v_pending FROM public.pending_users WHERE university_id = v_uni_id;

  IF v_pending.university_id IS NOT NULL THEN
    -- Create profile using the pre-registered details
    INSERT INTO public.profiles (
      id,
      university_id,
      name_ar,
      name_fr,
      role,
      faculty_id,
      department,
      date_of_birth,
      place_of_birth,
      section,
      level,
      status
    )
    VALUES (
      NEW.id,
      v_pending.university_id,
      v_pending.name_ar,
      v_pending.name_fr,
      v_pending.role,
      v_pending.faculty_id,
      v_pending.department,
      v_pending.date_of_birth,
      v_pending.place_of_birth,
      v_pending.section,
      v_pending.level,
      'active'
    );
    
    -- Delete from staging table since the account is now active
    DELETE FROM public.pending_users WHERE university_id = v_uni_id;

    -- Auto-confirm email so user can log in immediately after activation
    UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE id = NEW.id;
  
  -- Handle default seeded Admin case — the profile is
  -- created directly by seed.sql, so we just skip here.
  ELSIF v_uni_id = 'admin' THEN
    NULL; -- Seed script handles this
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users (runs after a user signs up)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ==========================================
-- DATABASE TRIGGERS FOR GRADE CALCULATIONS
-- ==========================================

-- Trigger function to calculate average and credits
CREATE OR REPLACE FUNCTION trigger_calculate_enrollment_grades()
RETURNS TRIGGER AS $$
DECLARE
  v_credits NUMERIC(4,2);
  v_exam_score NUMERIC(4,2);
BEGIN
  -- Fetch the credit value of the subject
  SELECT credits INTO v_credits FROM subjects WHERE id = NEW.subject_id;
  
  -- Determine which exam score to use.
  -- If Exam 2 is taken, it replaces Exam 1
  IF NEW.exam_session_2 IS NOT NULL THEN
    v_exam_score := NEW.exam_session_2;
  ELSE
    v_exam_score := NEW.exam_session_1;
  END IF;

  -- Compute the average only if classwork and the active exam are entered
  IF NEW.classwork IS NOT NULL AND v_exam_score IS NOT NULL THEN
    NEW.subject_average := (NEW.classwork * 0.3) + (v_exam_score * 0.7);
    
    -- Capping Rule: If a student did Exam 2 (catch-up session), their average is capped at 10.00
    IF NEW.exam_session_2 IS NOT NULL AND NEW.subject_average > 10.00 THEN
      NEW.subject_average := 10.00;
    END IF;
  ELSE
    NEW.subject_average := NULL;
  END IF;

  -- Determine credits earned
  IF NEW.subject_average IS NOT NULL AND NEW.subject_average >= 10.00 THEN
    NEW.credits_earned := v_credits;
  ELSE
    NEW.credits_earned := 0.00;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger to enrollments table
DROP TRIGGER IF EXISTS trg_calculate_enrollment_grades ON enrollments;
CREATE TRIGGER trg_calculate_enrollment_grades
  BEFORE INSERT OR UPDATE OF classwork, exam_session_1, exam_session_2
  ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_enrollment_grades();


-- ==========================================
-- AUTOMATIC ENROLLMENT TRIGGERS
-- ==========================================

-- Function to enroll existing matching students when a subject is created
CREATE OR REPLACE FUNCTION trigger_enroll_students_in_new_subject()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO enrollments (student_id, subject_id)
  SELECT p.id, NEW.id
  FROM profiles p
  WHERE p.role = 'student'
    AND p.section = NEW.section
    AND p.level = NEW.level
    AND p.faculty_id = NEW.faculty_id
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enroll_students_in_new_subject ON subjects;
CREATE TRIGGER trg_enroll_students_in_new_subject
  AFTER INSERT ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_enroll_students_in_new_subject();


-- Function to enroll a new student in all matching subjects when they register
CREATE OR REPLACE FUNCTION trigger_enroll_new_student_in_subjects()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' AND NEW.section IS NOT NULL AND NEW.level IS NOT NULL THEN
    INSERT INTO enrollments (student_id, subject_id)
    SELECT NEW.id, s.id
    FROM subjects s
    WHERE s.section = NEW.section
      AND s.level = NEW.level
      AND s.faculty_id = NEW.faculty_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enroll_new_student_in_subjects ON profiles;
CREATE TRIGGER trg_enroll_new_student_in_subjects
  AFTER INSERT OR UPDATE OF section, level ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_enroll_new_student_in_subjects();


-- ==========================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Drop existing policies to make this script re-runnable
DROP POLICY IF EXISTS "Allow users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admins full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow deans to manage profiles in their faculty" ON profiles;
DROP POLICY IF EXISTS "Allow read access to pending users for activation verification" ON pending_users;
DROP POLICY IF EXISTS "Allow deans to manage pending users in their faculty" ON pending_users;
DROP POLICY IF EXISTS "Allow admins full access to pending users" ON pending_users;
DROP POLICY IF EXISTS "Allow read access to faculties" ON faculties;
DROP POLICY IF EXISTS "Allow admin full access to faculties" ON faculties;
DROP POLICY IF EXISTS "Allow read access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow deans to manage subjects in their faculty" ON subjects;
DROP POLICY IF EXISTS "Allow students to view their own enrollments/grades" ON enrollments;
DROP POLICY IF EXISTS "Allow teachers to view and update grades for their subjects" ON enrollments;
DROP POLICY IF EXISTS "Allow deans to view and manage enrollments in their faculty" ON enrollments;
DROP POLICY IF EXISTS "Allow anyone to read announcements" ON announcements;
DROP POLICY IF EXISTS "Allow admin to manage all announcements" ON announcements;
DROP POLICY IF EXISTS "Allow deans to manage announcements in their faculty" ON announcements;
DROP POLICY IF EXISTS "Allow teachers to manage announcements for their subjects" ON announcements;

-- Enable RLS on all tables
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Allow users to read profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow admins full access to profiles" ON profiles
  FOR ALL TO authenticated USING (
    current_user_role() = 'admin'
  );

CREATE POLICY "Allow deans to manage profiles in their faculty" ON profiles
  FOR ALL TO authenticated USING (
    current_user_role() IN ('dean', 'assistant_dean')
    AND faculty_id = current_user_faculty_id()
  );

-- 2. Pending Users RLS
CREATE POLICY "Allow read access to pending users for activation verification" ON pending_users
  FOR SELECT USING (true);

CREATE POLICY "Allow deans to manage pending users in their faculty" ON pending_users
  FOR ALL TO authenticated USING (
    current_user_role() IN ('dean', 'assistant_dean')
    AND faculty_id = current_user_faculty_id()
  );

CREATE POLICY "Allow admins full access to pending users" ON pending_users
  FOR ALL TO authenticated USING (
    current_user_role() = 'admin'
  );

-- 3. Faculties RLS
CREATE POLICY "Allow read access to faculties" ON faculties
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to faculties" ON faculties
  FOR ALL TO authenticated USING (
    current_user_role() = 'admin'
  );

-- 4. Subjects RLS
CREATE POLICY "Allow read access to subjects" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Allow deans to manage subjects in their faculty" ON subjects
  FOR ALL TO authenticated USING (
    current_user_role() IN ('dean', 'assistant_dean')
    AND faculty_id = current_user_faculty_id()
  );

-- 5. Enrollments RLS
CREATE POLICY "Allow students to view their own enrollments/grades" ON enrollments
  FOR SELECT TO authenticated USING (
    student_id = auth.uid()
  );

CREATE POLICY "Allow teachers to view and update grades for their subjects" ON enrollments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = enrollments.subject_id
        AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Allow deans to view and manage enrollments in their faculty" ON enrollments
  FOR ALL TO authenticated USING (
    current_user_role() IN ('dean', 'assistant_dean')
    AND EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = enrollments.subject_id
        AND s.faculty_id = current_user_faculty_id()
    )
  );

-- 6. Announcements RLS
CREATE POLICY "Allow anyone to read announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage all announcements" ON announcements
  FOR ALL TO authenticated USING (
    current_user_role() = 'admin'
  );

CREATE POLICY "Allow deans to manage announcements in their faculty" ON announcements
  FOR ALL TO authenticated USING (
    current_user_role() IN ('dean', 'assistant_dean')
    AND faculty_id = current_user_faculty_id()
  );

CREATE POLICY "Allow teachers to manage announcements for their subjects" ON announcements
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM subjects s
      WHERE s.id = announcements.subject_id
        AND s.teacher_id = auth.uid()
    )
  );
