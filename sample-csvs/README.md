# Sample CSV Files for Grade Management System

## Upload Order (CRITICAL)

### 1. Faculties → 2. Deans → 3. Teachers → 4. Students → 5. Subjects

Faculties must be uploaded **first** because Deans, Teachers, and Subjects all reference them.

---

## Workflow

### Step 1 — Upload Faculties
**Admin → Office → Importer Facultés CSV**
- File: `faculties.csv`
- Just `name_ar, name_fr` — UUIDs auto-generate.

### Step 2 — Upload Deans
**Admin → Office → Importer CSV**
- File: `deans.csv` (updated with real UUIDs from the DB)
- `faculty_id` column already contains the actual faculty UUIDs.
- No placeholder replacement needed.

### Step 3 — Upload Teachers (per faculty)
**Dean → CSV → Importer CSV**
- Each dean logs in and uploads only their faculty's file.
- `faculty_id` is auto-injected from the dean's account — **not** from the CSV.
- Ready-to-use per-faculty files:

| File | For Dean of |
|------|-------------|
| `teachers_sciences.csv` | Faculté des Sciences |
| `teachers_ingenierie.csv` | Faculté d'Ingénierie |
| `teachers_medecine.csv` | Faculté de Médecine |
| `teachers_lettres.csv` | Faculté des Lettres |
| `teachers_economie.csv` | Faculté d'Économie |

**Or** use the combined `teachers.csv` (includes `faculty_id` column for reference).

### Step 4 — Upload Subjects
**Dean → Curriculum → Importer Matières CSV**
- File: `subjects.csv`
- All subjects under "Génie Informatique" (Faculté d'Ingénierie).
- `teacher_id` is optional — leave blank to assign later.

---

## File Reference

| File | Columns | Notes |
|------|---------|-------|
| `faculties.csv` | `name_ar, name_fr` | Upload first. UUIDs auto-generated. |
| `deans.csv` | `university_id, name_ar, name_fr, role, faculty_id, department` | UUIDs match existing DB faculties. |
| `teachers.csv` | `university_id, name_ar, name_fr, role, section, level, department, date_of_birth, place_of_birth, faculty_id` | Combined reference file. |
| `teachers_{faculty}.csv` | `university_id, name_ar, name_fr, role, section, level, department, date_of_birth, place_of_birth` | Per-faculty files ready for dean upload (no UUID column needed). |
| `subjects.csv` | `name_ar, name_fr, unit_name_ar, unit_name_fr, credits, section, level, semester, teacher_id` | Génie Informatique curriculum. |

## Faculty UUIDs (already in use)

| Faculty | UUID |
|---------|------|
| Faculté des Sciences | `e9317edb-ff85-4ce0-b89a-aee5838d0a39` |
| Faculté d'Ingénierie | `a9106b13-520d-4413-9d41-1c37af63e683` |
| Faculté de Médecine | `a77fd325-f402-4b62-875f-6e3b27963eaa` |
| Faculté des Lettres et Sciences Humaines | `54b13d79-1484-43e4-908e-d9b566e9e8df` |
| Faculté d'Économie et Sciences Politiques | `1e5f62c3-2f2b-455a-87ea-90bea7cf9e0f` |
