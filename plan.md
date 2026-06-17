# Project Plan: King Faisal University Grade Management System

This document outlines the step-by-step development process for the React + Vite + Tailwind CSS v4 + Supabase application.

## Phase 1: Environment & Project Setup
- [x] Initialize the React + Vite frontend application in `c:/projects/uniapp`.
- [x] Configure Tailwind CSS v4.
- [x] Install required libraries (`lucide-react`, `@supabase/supabase-js`, custom SVG charts).
- [x] Set up the Supabase client file (`src/lib/supabase.ts`).

## Phase 2: Database Schema & Row-Level Security (RLS)
- [x] Set up SQL script to create Tables:
  - [x] `faculties`
  - [x] `profiles` (for user roles and details)
  - [x] `subjects` (assigned to teachers)
  - [x] `enrollments` (join table with grades)
  - [x] `announcements`
- [x] Configure RLS policies in Supabase:
  - [x] Students can read their own grades/profiles, read announcements.
  - [x] Teachers can read/write grades for their subjects, read profiles, read/write their announcements.
  - [x] Deans can read/write everything in their Faculty.
  - [x] Admins have full access.
- [x] Seed default admin credentials.


## Phase 3: Authentication & Onboarding
- [x] Build Login Screen (using University ID, resolving to `[id]@uni.edu` on the backend).
- [x] Build Account Activation Page (enters ID, sets password if pending).
- [x] Implement Auth Context/Hooks in React to manage sessions and roles.


## Phase 4: Admin Dashboard
- [x] Home page with university-wide stats (total faculties, deans, teachers, students, recent accounts).
- [x] Office panel:
  - [x] Create Faculty.
  - [x] Create Dean/Assistant accounts.
- [x] Profile page (change password).

## Phase 5: Dean & Assistant Dashboard
- [x] Home page with analytics (pass rates, distributions, subjects charts).
- [x] Office panel:
  - [x] CSV Uploader (with pre-validation and duplication skip).
  - [x] Curriculum manager (Create subjects, link to units, set credits, assign teacher).
  - [x] Promotion Manager (promote students by level/section).
  - [x] Announcements creator.
- [x] Profile page.

## Phase 6: Teacher Dashboard
- [x] Home page with announcements.
- [x] Subjects panel:
  - [x] Spreadsheet grade editor (inputs for أعمال, امتحان 1, امتحان 2).
  - [x] Auto-calculate subject average and credit rewards.
  - [x] Subject-specific announcements creator.
- [x] Profile page.

## Phase 7: Student Dashboard
- [x] Home page with announcements feed.
- [x] Grades panel:
  - [x] Grades list table.
  - [x] Bilingual A4 portrait print/PDF view (`window.print()` using CSS `@media print`).
- [x] Profile page.

## Phase 8: Verification & Testing
- [ ] Verify automatic enrollment triggers.
- [ ] Verify grade calculation formulas:
  - [ ] `(Classwork * 0.3) + (max(Exam 1, Exam 2) * 0.7)`.
  - [ ] Credit award condition ($\ge 10.00$).
- [ ] Verify Promotion Manager preserves grade history.

## Change Log
- **DB trigger fix**: Grade calculation updated to use `max(Exam 1, Exam 2)` instead of "Exam 2 replaces Exam 1". Removed Exam 2 average cap of 10.00 that contradicted the plan formula.
