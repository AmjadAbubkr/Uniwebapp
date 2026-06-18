import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LangToggle } from './LangToggle';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  Plus, 
  KeyRound, 
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Activity,
  Upload,
  FileSpreadsheet,
  Pencil,
  Check,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, profile } = useAuth();
  const { t } = useLang();
  const [pageKey, setPageKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'office' | 'profile'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stats States
  const [stats, setStats] = useState({
    faculties: 0,
    deans: 0,
    teachers: 0,
    students: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // Office States (Faculties)
  const [facultiesList, setFacultiesList] = useState<any[]>([]);
  const [facultyNameAr, setFacultyNameAr] = useState('');
  const [facultyNameFr, setFacultyNameFr] = useState('');

  // CSV state for faculty bulk import
  const [facultyCsvLoading, setFacultyCsvLoading] = useState(false);
  const [facultyCsvResults, setFacultyCsvResults] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  // Office States (Deans/Assistants registration)
  const [deansList, setDeansList] = useState<any[]>([]);
  const [pendingDeansList, setPendingDeansList] = useState<any[]>([]);
  const [deanId, setDeanId] = useState('');
  const [deanNameAr, setDeanNameAr] = useState('');
  const [deanNameFr, setDeanNameFr] = useState('');
  const [deanRole, setDeanRole] = useState<'dean' | 'assistant_dean'>('dean');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [deanDepartment, setDeanDepartment] = useState('');

  // CSV state for dean bulk import
  const [deanCsvLoading, setDeanCsvLoading] = useState(false);
  const [deanCsvResults, setDeanCsvResults] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  const [editingDeanId, setEditingDeanId] = useState<string | null>(null);
  const [editingPendingId, setEditingPendingId] = useState<string | null>(null);
  const [deanEditValues, setDeanEditValues] = useState<any>({});

  const startEditDean = (d: any) => {
    setEditingDeanId(d.id);
    setDeanEditValues({ name_fr: d.name_fr, name_ar: d.name_ar, role: d.role, faculty_id: d.faculty_id });
  };

  const startEditPending = (d: any) => {
    setEditingPendingId(d.id);
    setDeanEditValues({ name_fr: d.name_fr, name_ar: d.name_ar, role: d.role, faculty_id: d.faculty_id });
  };

  const cancelEditDean = () => { setEditingDeanId(null); setEditingPendingId(null); setDeanEditValues({}); };

  const saveEditDean = async () => {
    if (!editingDeanId) return;
    const { error } = await supabase.from('profiles').update(deanEditValues).eq('id', editingDeanId);
    if (!error) { setEditingDeanId(null); setDeanEditValues({}); loadOfficeData(); }
    else setError(error.message);
  };

  const saveEditPending = async () => {
    if (!editingPendingId) return;
    const { error } = await supabase.from('pending_users').update(deanEditValues).eq('id', editingPendingId);
    if (!error) { setEditingPendingId(null); setDeanEditValues({}); loadOfficeData(); }
    else setError(error.message);
  };

  // Profile Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ==========================================
  // DATA LOADERS
  // ==========================================
  const loadStats = async () => {
    try {
      const { count: facCount } = await supabase.from('faculties').select('*', { count: 'exact', head: true });
      
      const { count: deanCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['dean', 'assistant_dean']);
      
      const { count: teacherCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      setStats({
        faculties: facCount || 0,
        deans: deanCount || 0,
        teachers: teacherCount || 0,
        students: studentCount || 0
      });

      // Fetch 5 most recent active users
      const { data: recent } = await supabase
        .from('profiles')
        .select('university_id, name_fr, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentUsers(recent || []);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadOfficeData = async () => {
    try {
      // Load Faculties
      const { data: facs } = await supabase.from('faculties').select('*').order('name_fr', { ascending: true });
      setFacultiesList(facs || []);

      // Load active Deans/Assistants
      const { data: activeDeans } = await supabase
        .from('profiles')
        .select('*, faculties(name_fr)')
        .in('role', ['dean', 'assistant_dean'])
        .order('created_at', { ascending: false });
      setDeansList(activeDeans || []);

      // Load pending Deans/Assistants
      const { data: pendingDeans } = await supabase
        .from('pending_users')
        .select('*, faculties(name_fr)')
        .in('role', ['dean', 'assistant_dean'])
        .order('created_at', { ascending: false });
      setPendingDeansList(pendingDeans || []);
    } catch (err) {
      console.error('Error loading office data:', err);
    }
  };

  // Increment pageKey to trigger page transition animation on tab switch
  useEffect(() => {
    setPageKey(k => k + 1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'home') {
      loadStats();
    } else if (activeTab === 'office') {
      loadOfficeData();
    }
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  
  // 1. Create Faculty
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyNameAr.trim() || !facultyNameFr.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertError } = await supabase
        .from('faculties')
        .insert({
          name_ar: facultyNameAr.trim(),
          name_fr: facultyNameFr.trim()
        });

      if (insertError) throw insertError;

      setSuccess(t('Faculty created successfully!', 'تم إنشاء الكلية بنجاح'));
      setFacultyNameAr('');
      setFacultyNameFr('');
      loadOfficeData();
    } catch (err: any) {
      setError(err.message || 'Error creating faculty.');
    } finally {
      setLoading(false);
    }
  };

  // 2b. Faculty CSV Bulk Import
  const handleFacultyCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFacultyCsvResults(null);
    setFacultyCsvLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) { setFacultyCsvLoading(false); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['name_ar', 'name_fr'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setFacultyCsvResults({ inserted: 0, skipped: 0, errors: [`Missing columns: ${missing.join(', ')}`] });
        setFacultyCsvLoading(false);
        return;
      }

      const arIdx = headers.indexOf('name_ar');
      const frIdx = headers.indexOf('name_fr');

      let inserted = 0, skipped = 0;
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const nameAr = cols[arIdx];
        const nameFr = cols[frIdx];

        if (!nameAr || !nameFr) { errs.push(`Row ${i + 1}: Missing name_ar or name_fr`); continue; }

        const { data: existing } = await supabase
          .from('faculties')
          .select('id')
          .eq('name_fr', nameFr)
          .maybeSingle();

        if (existing) { skipped++; continue; }

        const { error: insertError } = await supabase.from('faculties').insert({ name_ar: nameAr, name_fr: nameFr });
        if (insertError) { errs.push(`Row ${i + 1}: ${insertError.message}`); } else { inserted++; }
      }

      setFacultyCsvResults({ inserted, skipped, errors: errs });
      if (inserted > 0) loadOfficeData();
    } catch (_err: any) { /* ignore */ }
    finally { setFacultyCsvLoading(false); e.target.value = ''; }
  };

  // 2. Register Dean / Assistant (inserts into pending_users)
  const handleRegisterDean = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formattedId = deanId.trim().toLowerCase();

    if (!formattedId || !deanNameAr.trim() || !deanNameFr.trim() || !selectedFacultyId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Check if ID already exists in profiles
      const { data: existsProfile } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('university_id', formattedId)
        .maybeSingle();

      if (existsProfile) {
        setError('A user with this ID is already active in the system.');
        setLoading(false);
        return;
      }

      // Check if ID already exists in pending_users
      const { data: existsPending } = await supabase
        .from('pending_users')
        .select('university_id')
        .eq('university_id', formattedId)
        .maybeSingle();

      if (existsPending) {
        setError('A user with this ID is already waiting for activation.');
        setLoading(false);
        return;
      }

      // Insert into pending_users table
      const { error: insertError } = await supabase
        .from('pending_users')
        .insert({
          university_id: formattedId,
          name_ar: deanNameAr.trim(),
          name_fr: deanNameFr.trim(),
          role: deanRole,
          faculty_id: selectedFacultyId,
          department: deanDepartment.trim() || null
        });

      if (insertError) throw insertError;

      setSuccess(`Registrations complete! Dean ID "${formattedId}" can now activate their account.`);
      setDeanId('');
      setDeanNameAr('');
      setDeanNameFr('');
      setDeanDepartment('');
      loadOfficeData();
    } catch (err: any) {
      setError(err.message || 'Error registering dean.');
    } finally {
      setLoading(false);
    }
  };

  // 2b. CSV Bulk Import for Deans
  const handleDeanCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDeanCsvResults(null);
    setDeanCsvLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) { setDeanCsvLoading(false); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['university_id', 'name_ar', 'name_fr', 'role', 'faculty_id'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setError(`CSV missing columns: ${missing.join(', ')}`);
        setDeanCsvLoading(false);
        return;
      }

      const idIdx = headers.indexOf('university_id');
      const arIdx = headers.indexOf('name_ar');
      const frIdx = headers.indexOf('name_fr');
      const roleIdx = headers.indexOf('role');
      const facIdx = headers.indexOf('faculty_id');
      const deptIdx = headers.indexOf('department');

      let inserted = 0, skipped = 0;
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const uniId = cols[idIdx]?.toLowerCase();
        const role = cols[roleIdx]?.toLowerCase();

        if (!uniId || !role) { errs.push(`Row ${i + 1}: Missing university_id or role`); continue; }
        if (!['dean', 'assistant_dean'].includes(role)) { errs.push(`Row ${i + 1}: Role must be dean or assistant_dean`); continue; }

        const { data: ep } = await supabase.from('profiles').select('university_id').eq('university_id', uniId).maybeSingle();
        if (ep) { skipped++; continue; }
        const { data: epen } = await supabase.from('pending_users').select('university_id').eq('university_id', uniId).maybeSingle();
        if (epen) { skipped++; continue; }

        const { error: insertError } = await supabase.from('pending_users').insert({
          university_id: uniId,
          name_ar: cols[arIdx] || '',
          name_fr: cols[frIdx] || '',
          role,
          faculty_id: cols[facIdx] || null,
          department: deptIdx >= 0 ? cols[deptIdx] || null : null,
        });
        if (insertError) { errs.push(`Row ${i + 1}: ${insertError.message}`); } else { inserted++; }
      }

      setDeanCsvResults({ inserted, skipped, errors: errs });
      if (inserted > 0) loadOfficeData();
    } catch (_err: any) { /* ignore */ }
    finally { setDeanCsvLoading(false); e.target.value = ''; }
  };

  // 3. Update Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white safe-top">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-64 bg-[#0a0e1a] text-[#e8f7fc] flex flex-col justify-between shrink-0 shadow-xl border-r border-[#0077a8]">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-[#0077a8] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00b4d8] rounded-lg flex items-center justify-center shadow-md p-1.5">
              <img src={logo} alt="KF" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-[#0099c2] font-semibold uppercase">Admin Panel</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#00b4d8] text-white shadow-lg'
                  : 'text-[#0099c2] hover:bg-[#0077a8] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('Tableau de Bord', 'الرئيسية')}</span>
            </button>

            <button
              onClick={() => setActiveTab('office')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'office'
                  ? 'bg-[#00b4d8] text-white shadow-lg'
                  : 'text-[#0099c2] hover:bg-[#0077a8] hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>{t('Office', 'إدارة الكليات')}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#00b4d8] text-white shadow-lg'
                  : 'text-[#0099c2] hover:bg-[#0077a8] hover:text-white'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span>{t('Profil', 'الملف الشخصي')}</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-[#0077a8] space-y-3">
          <div className="px-4 py-3 bg-[#0077a8]/50 rounded-lg flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#00b4d8]/20 text-[#0099c2] flex items-center justify-center font-bold">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Admin'}</p>
              <span className="text-[10px] text-[#0099c2] uppercase font-semibold">Administrateur</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-sm font-semibold cursor-pointer transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('Déconnexion', 'خروج')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        {/* Header bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e8f7fc]/60 flex items-center justify-between px-4 lg:px-8 py-3 lg:py-0 lg:h-20">
          <div>
            <h1 className="text-xl font-extrabold text-[#000000]">
              {activeTab === 'home' && t('Tableau de Bord', 'لوحة التحكم')}
              {activeTab === 'office' && t('Administration', 'المكتب الإداري')}
              {activeTab === 'profile' && t('Paramètres du Profil', 'إعدادات الحساب')}
            </h1>
            <p className="text-xs text-[#666666]">
              Content and database controls updated in real-time
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </header>

        {/* Dynamic Inner Page */}
        <div className="p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-4 lg:space-y-8">
          
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-md flex items-start space-x-2 text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#e8f7fc] border-l-4 border-[#00b4d8] rounded-r-md flex items-start space-x-2 text-[#0077a8] text-sm">
              <Activity className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div key={pageKey} className="animate-page-in">
          {/* ==========================================
              TAB 1: HOME VIEW
             ========================================== */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                
                {/* Faculties */}
                <div className="bg-white/70 backdrop-blur-sm p-5 lg:p-6 rounded-[20px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">{t('Facultés', 'الكليات')}</p>
                      <h3 className="text-3xl font-black text-[#000000] mt-2">{stats.faculties}</h3>
                    </div>
                    <div className="w-12 h-12 bg-[#e8f7fc] rounded-lg flex items-center justify-center text-[#00b4d8]">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Deans */}
                <div className="bg-white/70 backdrop-blur-sm p-5 lg:p-6 rounded-[20px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">{t('Doyens', 'العمداء')}</p>
                      <h3 className="text-3xl font-black text-[#000000] mt-2">{stats.deans}</h3>
                    </div>
                    <div className="w-12 h-12 bg-[#fdf3e0] rounded-lg flex items-center justify-center text-[#c9902a]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Teachers */}
                <div className="bg-white/70 backdrop-blur-sm p-5 lg:p-6 rounded-[20px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">{t('Professeurs', 'الأساتذة')}</p>
                      <h3 className="text-3xl font-black text-[#000000] mt-2">{stats.teachers}</h3>
                    </div>
                    <div className="w-12 h-12 bg-[#e8f7fc] rounded-lg flex items-center justify-center text-[#00b4d8]">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Students */}
                <div className="bg-white/70 backdrop-blur-sm p-5 lg:p-6 rounded-[20px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">{t('Étudiants', 'الطلاب')}</p>
                      <h3 className="text-3xl font-black text-[#000000] mt-2">{stats.students}</h3>
                    </div>
                    <div className="w-12 h-12 bg-[#e8f7fc] rounded-lg flex items-center justify-center text-[#0099c2]">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Activity Panel */}
              <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                <h3 className="text-lg font-bold text-[#000000] mb-6 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#00b4d8]" />
                  <span>{t('Derniers Comptes Activés', 'أحدث الحسابات النشطة')}</span>
                </h3>
                <div className="divide-y divide-[#e8f7fc]">
                  {recentUsers.length === 0 ? (
                    <p className="text-sm text-[#666666] py-4 text-center">{t('Aucune activité récente', 'لا يوجد نشاط مؤخراً')}</p>
                  ) : (
                    recentUsers.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-[#e8f7fc] flex items-center justify-center font-bold text-[#00b4d8]">
                            {user.university_id.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#000000]">{user.name_fr}</p>
                            <span className="text-[10px] bg-[#e8f7fc] text-[#00b4d8] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#666666]">{new Date(user.created_at).toLocaleDateString()}</p>
                          <span className="text-xs text-[#666666] font-semibold">{user.university_id}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: OFFICE VIEW (Management forms)
             ========================================== */}
          {activeTab === 'office' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form Col 1: Create Faculty */}
              <div className="lg:col-span-1 space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">

                  {/* Existing manual form card */}
                  <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                    <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-[#00b4d8]" />
                      <span>{t('Créer une Faculté', 'إنشاء كلية')}</span>
                    </h3>
                    <form onSubmit={handleCreateFaculty} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          Nom de la Faculté (French)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Faculté des Sciences"
                          value={facultyNameFr}
                          onChange={(e) => setFacultyNameFr(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          اسم الكلية (Arabic)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: كلية العلوم"
                          value={facultyNameAr}
                          onChange={(e) => setFacultyNameAr(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8] text-right"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all"
                      >
                        {loading ? 'Création...' : 'Créer Faculté'}
                      </button>
                    </form>
                  </div>

                  {/* New CSV upload card */}
                  <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                    <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#00b4d8]" />
                      <span>{t('Importer Facultés CSV', 'رفع ملف')}</span>
                    </h3>
                    <p className="text-sm text-[#666666] mb-4">
                      Required: <code className="bg-[#e8f7fc] px-2 py-0.5 rounded text-xs">name_ar, name_fr</code>
                    </p>
                    <p className="text-xs text-[#666666] mb-4">Duplicates are skipped by matching <code className="bg-[#e8f7fc] px-1 rounded">name_fr</code>.</p>
                    <div className="border-2 border-dashed border-[#d2d6db] rounded-lg p-6 text-center hover:border-[#00b4d8] transition-colors">
                      <label className="cursor-pointer">
                        <span className="px-6 py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md shadow-md inline-block transition-all">
                          {facultyCsvLoading ? 'Traitement...' : 'Sélectionner CSV'}
                        </span>
                        <input type="file" accept=".csv" onChange={handleFacultyCsvUpload} disabled={facultyCsvLoading} className="hidden" />
                      </label>
                    </div>
                    {facultyCsvResults && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[#e8f7fc] rounded-md text-center">
                            <p className="text-2xl font-black text-[#00b4d8]">{facultyCsvResults.inserted}</p>
                            <p className="text-xs text-[#0077a8] font-semibold">{t('Insérées', 'مدرجة')}</p>
                          </div>
                          <div className="p-4 bg-[#fdf3e0] rounded-md text-center">
                            <p className="text-2xl font-black text-[#c9902a]">{facultyCsvResults.skipped}</p>
                            <p className="text-xs text-[#a07020] font-semibold">{t('Ignorées', 'متجاهلة')}</p>
                          </div>
                        </div>
                        {facultyCsvResults.errors.length > 0 && (
                          <div className="p-3 bg-rose-50 rounded-md">
                            {facultyCsvResults.errors.slice(0, 10).map((err, i) => (
                              <p key={i} className="text-xs text-rose-500">{err}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* List of existing faculties */}
                <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                  <h4 className="text-sm font-bold text-[#666666] uppercase tracking-wider mb-4">
                    Facultés Existantes ({facultiesList.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {facultiesList.map((fac, idx) => (
                      <div key={idx} className="p-3 bg-[#e8f7fc] border border-[#e8f7fc] rounded-md flex justify-between items-center text-xs">
                        <div className="font-semibold text-[#000000]">{fac.name_fr}</div>
                        <div className="text-[#666666] text-right">{fac.name_ar}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Col 2: Register Dean / Assistant — two side-by-side cards */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Manual form card */}
                  <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                    <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-[#00b4d8]" />
                      <span>{t('Ajouter Manuellement', 'يدوي')}</span>
                    </h3>
                    <form onSubmit={handleRegisterDean} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          {t('Identifiant (ID)', 'معرف الحساب (ID)')} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: dean01, dean_assistant"
                          value={deanId}
                          onChange={(e) => setDeanId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          {t('Faculté', 'الكلية المعين بها')} *
                        </label>
                        <select
                          required
                          value={selectedFacultyId}
                          onChange={(e) => setSelectedFacultyId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden"
                        >
                          <option value="">Sélectionner Faculté</option>
                          {facultiesList.map((f, i) => (
                            <option key={i} value={f.id}>{f.name_fr}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          Nom et Prénom (French/English) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Dr. Ahmed Mohamed"
                          value={deanNameFr}
                          onChange={(e) => setDeanNameFr(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1 text-right">
                          الاسم واللقب (بالعربية) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: د. أحمد محمد"
                          value={deanNameAr}
                          onChange={(e) => setDeanNameAr(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          {t('Rôle', 'الدور الوظيفي')} *
                        </label>
                        <select
                          required
                          value={deanRole}
                          onChange={(e) => setDeanRole(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden"
                        >
                          <option value="dean">Doyen (عميد)</option>
                          <option value="assistant_dean">Assistant Doyen (مساعد العميد)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                          {t('Département', 'القسم')} (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Informatique"
                          value={deanDepartment}
                          onChange={(e) => setDeanDepartment(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all"
                      >
                        {loading ? t('Inscription...', 'تسجيل...') : t('Enregistrer', 'تسجيل')}
                      </button>
                    </form>
                  </div>

                  {/* CSV upload card */}
                  <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                    <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-[#00b4d8]" />
                      <span>{t('Importer CSV', 'رفع ملف')}</span>
                    </h3>
                    <p className="text-sm text-[#666666] mb-4">
                      Required: <code className="bg-[#e8f7fc] px-2 py-0.5 rounded text-xs">university_id, name_ar, name_fr, role, faculty_id</code>
                      <br />Optional: <code className="bg-[#e8f7fc] px-2 py-0.5 rounded text-xs">department</code>
                    </p>
                    <p className="text-xs text-[#666666] mb-4">Role must be <code className="bg-[#e8f7fc] px-1 rounded">dean</code> or <code className="bg-[#e8f7fc] px-1 rounded">assistant_dean</code>. faculty_id must be a valid UUID.</p>
                    <div className="border-2 border-dashed border-[#d2d6db] rounded-lg p-6 text-center hover:border-[#00b4d8] transition-colors">
                      <label className="cursor-pointer">
                        <span className="px-6 py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md shadow-md inline-block transition-all">
                          {deanCsvLoading ? 'Traitement...' : 'Sélectionner CSV'}
                        </span>
                        <input type="file" accept=".csv" onChange={handleDeanCsvUpload} disabled={deanCsvLoading} className="hidden" />
                      </label>
                    </div>
                    {deanCsvResults && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[#e8f7fc] rounded-md text-center">
                            <p className="text-2xl font-black text-[#00b4d8]">{deanCsvResults.inserted}</p>
                            <p className="text-xs text-[#0077a8] font-semibold">{t('Insérés', 'مسجلون')}</p>
                          </div>
                          <div className="p-4 bg-[#fdf3e0] rounded-md text-center">
                            <p className="text-2xl font-black text-[#c9902a]">{deanCsvResults.skipped}</p>
                            <p className="text-xs text-[#a07020] font-semibold">Ignorés</p>
                          </div>
                        </div>
                        {deanCsvResults.errors.length > 0 && (
                          <div className="p-3 bg-rose-50 rounded-md">
                            {deanCsvResults.errors.slice(0, 10).map((err, i) => (
                              <p key={i} className="text-xs text-rose-500">{err}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Table of active and pending Deans */}
                <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                  <h3 className="text-md font-bold text-[#000000] mb-4">
                    {t('Comptes Créés', 'الحسابات المسجلة')}
                  </h3>

                  {/* Active deans */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#00b4d8] rounded-full mr-2" />
                         Comptes Actifs (Actifs dans le système)
                       </h4>
                       {deansList.length === 0 ? (
                         <p className="text-xs text-[#666666] italic">Aucun compte actif</p>
                       ) : (
                         <div className="overflow-x-auto">
                           <table className="w-full text-left text-xs border-collapse">
                             <thead>
                               <tr className="border-b border-[#e8f7fc] text-[#666666] font-bold">
                                 <th className="pb-2">ID</th>
                                 <th className="pb-2">Nom (FR)</th>
                                 <th className="pb-2">الاسم (AR)</th>
                                 <th className="pb-2">Faculté</th>
                                 <th className="pb-2">Rôle</th>
                                 <th className="pb-2"></th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-[#e8f7fc]">
                               {deansList.map((d, i) => {
                                 const isEditing = editingDeanId === d.id;
                                 return (
                                   <tr key={i} className="text-[#000000]">
                                     <td className="py-2 font-semibold font-mono">{d.university_id}</td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <input value={deanEditValues.name_fr} onChange={e => setDeanEditValues((p: any) => ({ ...p, name_fr: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none" />
                                       ) : d.name_fr}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <input value={deanEditValues.name_ar} onChange={e => setDeanEditValues((p: any) => ({ ...p, name_ar: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs text-right focus:outline-none" />
                                       ) : d.name_ar}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <select value={deanEditValues.faculty_id} onChange={e => setDeanEditValues((p: any) => ({ ...p, faculty_id: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none">
                                           {facultiesList.map(f => <option key={f.id} value={f.id}>{f.name_fr}</option>)}
                                         </select>
                                       ) : d.faculties?.name_fr}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <select value={deanEditValues.role} onChange={e => setDeanEditValues((p: any) => ({ ...p, role: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none">
                                           <option value="dean">dean</option>
                                           <option value="assistant_dean">assistant_dean</option>
                                         </select>
                                       ) : <span className="font-bold uppercase text-[10px] text-[#00b4d8]">{d.role}</span>}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <div className="flex space-x-1">
                                           <button onClick={saveEditDean} className="text-[#00b4d8] hover:text-[#0077a8] cursor-pointer"><Check className="w-4 h-4" /></button>
                                           <button onClick={cancelEditDean} className="text-rose-500 hover:text-rose-700 cursor-pointer"><X className="w-4 h-4" /></button>
                                         </div>
                                       ) : (
                                         <button onClick={() => startEditDean(d)} className="text-[#666666] hover:text-[#00b4d8] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                       )}
                                     </td>
                                   </tr>
                                 );
                               })}
                             </tbody>
                           </table>
                         </div>
                       )}
                    </div>

                    {/* Pending deans */}
                    <div className="border-t border-[#e8f7fc] pt-4">
                      <h4 className="text-xs font-bold text-[#c9902a] uppercase tracking-wider mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#fdf3e0]0 rounded-full mr-2 animate-pulse" />
                         Comptes en Attente d'Activation (Staging)
                       </h4>
                       {pendingDeansList.length === 0 ? (
                         <p className="text-xs text-[#666666] italic">Aucun compte en attente</p>
                       ) : (
                         <div className="overflow-x-auto">
                           <table className="w-full text-left text-xs border-collapse">
                             <thead>
                               <tr className="border-b border-[#e8f7fc] text-[#666666] font-bold">
                                 <th className="pb-2">ID</th>
                                 <th className="pb-2">Nom (FR)</th>
                                 <th className="pb-2">الاسم (AR)</th>
                                 <th className="pb-2">Faculté</th>
                                 <th className="pb-2">Rôle</th>
                                 <th className="pb-2"></th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-[#e8f7fc]">
                               {pendingDeansList.map((d, i) => {
                                 const isEditing = editingPendingId === d.id;
                                 return (
                                   <tr key={i} className="text-[#000000]">
                                     <td className="py-2 font-semibold font-mono">{d.university_id}</td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <input value={deanEditValues.name_fr} onChange={e => setDeanEditValues((p: any) => ({ ...p, name_fr: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none" />
                                       ) : d.name_fr}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <input value={deanEditValues.name_ar} onChange={e => setDeanEditValues((p: any) => ({ ...p, name_ar: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs text-right focus:outline-none" />
                                       ) : d.name_ar}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <select value={deanEditValues.faculty_id} onChange={e => setDeanEditValues((p: any) => ({ ...p, faculty_id: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none">
                                           {facultiesList.map(f => <option key={f.id} value={f.id}>{f.name_fr}</option>)}
                                         </select>
                                       ) : d.faculties?.name_fr}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <select value={deanEditValues.role} onChange={e => setDeanEditValues((p: any) => ({ ...p, role: e.target.value }))} className="w-full px-2 py-1 border border-[#00b4d8] rounded text-xs focus:outline-none">
                                           <option value="dean">dean</option>
                                           <option value="assistant_dean">assistant_dean</option>
                                         </select>
                                       ) : <span className="font-bold uppercase text-[10px] text-[#c9902a]">{d.role}</span>}
                                     </td>
                                     <td className="py-2">
                                       {isEditing ? (
                                         <div className="flex space-x-1">
                                           <button onClick={saveEditPending} className="text-[#00b4d8] hover:text-[#0077a8] cursor-pointer"><Check className="w-4 h-4" /></button>
                                           <button onClick={cancelEditDean} className="text-rose-500 hover:text-rose-700 cursor-pointer"><X className="w-4 h-4" /></button>
                                         </div>
                                       ) : (
                                         <button onClick={() => startEditPending(d)} className="text-[#666666] hover:text-[#00b4d8] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                       )}
                                     </td>
                                   </tr>
                                 );
                               })}
                             </tbody>
                           </table>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 3: PROFILE VIEW
             ========================================== */}
          {activeTab === 'profile' && (
            <div className="max-w-md space-y-6">
              <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
                <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wider">
                  {t('Langue / اللغة', 'اللغة')}
                </h3>
                <LangToggle />
              </div>
              <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-8">
                <h3 className="text-lg font-bold text-[#000000] mb-6 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-[#00b4d8]" />
                  <span>{t('Modifier le Mot de Passe', 'تغيير كلمة المرور')}</span>
                </h3>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                      {t('Nouveau Mot de Passe', 'كلمة المرور الجديدة')}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                      {t('Confirmer le Mot de Passe', 'تأكيد كلمة المرور')}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all"
                  >
                    {loading ? t('Mise à jour...', 'تحديث...') : t('Mettre à jour', 'تحديث كلمة المرور')}
                  </button>
                </form>
              </div>
            </div>
          )}
          </div>

        </div>
      </main>

      {/* Bottom Navigation (mobile only) — floating pill */}
      <nav
        className="lg:hidden fixed left-4 right-4 z-50 flex justify-around items-center backdrop-blur-2xl bg-white/50 border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] h-16 overflow-hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        {[
          { key: 'home', icon: LayoutDashboard, label: 'الرئيسية' },
          { key: 'office', icon: Building2, label: 'كليات' },
          { key: 'profile', icon: KeyRound, label: 'الملف' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className="relative flex flex-col items-center justify-center w-full h-full rounded-[16px] transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Icon className={`w-5 h-5 transition-colors ${activeTab === key ? 'text-[#00b4d8]' : 'text-[#666666]'}`} />
            <span className={`text-[9px] mt-0.5 leading-tight ${activeTab === key ? 'text-[#00b4d8] font-semibold' : 'text-[#666666]'}`}>
              {label}
            </span>
            {activeTab === key && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#00b4d8] rounded-full opacity-90" />
            )}
          </button>
        ))}
      </nav>

    </div>
  );
};
