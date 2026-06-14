import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, profile } = useAuth();
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

  // Office States (Deans/Assistants registration)
  const [deansList, setDeansList] = useState<any[]>([]);
  const [pendingDeansList, setPendingDeansList] = useState<any[]>([]);
  const [deanId, setDeanId] = useState('');
  const [deanNameAr, setDeanNameAr] = useState('');
  const [deanNameFr, setDeanNameFr] = useState('');
  const [deanRole, setDeanRole] = useState<'dean' | 'assistant_dean'>('dean');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [deanDepartment, setDeanDepartment] = useState('');

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

      setSuccess('Faculty created successfully! / تم إنشاء الكلية بنجاح');
      setFacultyNameAr('');
      setFacultyNameFr('');
      loadOfficeData();
    } catch (err: any) {
      setError(err.message || 'Error creating faculty.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              KF
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-indigo-400 font-semibold uppercase">Admin Panel</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de Bord / الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveTab('office')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'office'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Office / إدارة الكليات</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span>Profil / الملف الشخصي</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-3 bg-slate-800/50 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Admin'}</p>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Administrateur</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-sm font-semibold cursor-pointer transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion / خروج</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header bar */}
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-8 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {activeTab === 'home' && 'Tableau de Bord / لوحة التحكم'}
              {activeTab === 'office' && 'Administration de l’Office / المكتب الإداري'}
              {activeTab === 'profile' && 'Paramètres du Profil / إعدادات الحساب'}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Content and database controls updated in real-time
            </p>
          </div>
        </header>

        {/* Dynamic Inner Page */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-r-xl flex items-start space-x-2 text-rose-800 dark:text-rose-200 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-2 text-emerald-800 dark:text-emerald-200 text-sm">
              <Activity className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ==========================================
              TAB 1: HOME VIEW
             ========================================== */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Faculties */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Facultés / الكليات</p>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.faculties}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Deans */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Doyens / العمداء</p>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.deans}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Teachers */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Professeurs / الأساتذة</p>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.teachers}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Students */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Étudiants / الطلاب</p>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.students}</h3>
                    </div>
                    <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/50 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Activity Panel */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <span>Derniers Comptes Activés / أحدث الحسابات النشطة</span>
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {recentUsers.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Aucune activité récente / لا يوجد نشاط مؤخراً</p>
                  ) : (
                    recentUsers.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {user.university_id.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.name_fr}</p>
                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString()}</p>
                          <span className="text-xs text-slate-500 font-semibold">{user.university_id}</span>
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
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    <span>Créer une Faculté / إنشاء كلية</span>
                  </h3>
                  <form onSubmit={handleCreateFaculty} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Nom de la Faculté (French)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Faculté des Sciences"
                        value={facultyNameFr}
                        onChange={(e) => setFacultyNameFr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        اسم الكلية (Arabic)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: كلية العلوم"
                        value={facultyNameAr}
                        onChange={(e) => setFacultyNameAr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all"
                    >
                      {loading ? 'Création...' : 'Créer Faculté'}
                    </button>
                  </form>
                </div>

                {/* List of existing faculties */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
                  <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Facultés Existantes ({facultiesList.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {facultiesList.map((fac, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl flex justify-between items-center text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{fac.name_fr}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-right">{fac.name_ar}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Col 2: Register Dean / Assistant */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    <span>Enregistrer Doyen / Assistant (تسجيل عميد أو مساعد)</span>
                  </h3>
                  <form onSubmit={handleRegisterDean} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Identifiant / معرف الحساب (ID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: dean01, dean_assistant"
                        value={deanId}
                        onChange={(e) => setDeanId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Faculté / الكلية المعين بها *
                      </label>
                      <select
                        required
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden"
                      >
                        <option value="">Sélectionner Faculté</option>
                        {facultiesList.map((f, i) => (
                          <option key={i} value={f.id}>{f.name_fr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Nom et Prénom (French/English) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Dr. Ahmed Mohamed"
                        value={deanNameFr}
                        onChange={(e) => setDeanNameFr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 text-right">
                        الاسم واللقب (بالعربية) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: د. أحمد محمد"
                        value={deanNameAr}
                        onChange={(e) => setDeanNameAr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Rôle / الدور الوظيفي *
                      </label>
                      <select
                        required
                        value={deanRole}
                        onChange={(e) => setDeanRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden"
                      >
                        <option value="dean">Doyen (عميد)</option>
                        <option value="assistant_dean">Assistant Doyen (مساعد العميد)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Département / القسم (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Informatique"
                        value={deanDepartment}
                        onChange={(e) => setDeanDepartment(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden"
                      />
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all"
                      >
                        {loading ? 'Inscription...' : 'Enregistrer le Doyen'}
                      </button>
                    </div>

                  </form>
                </div>

                {/* Table of active and pending Deans */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4">
                    Comptes Créés / الحسابات المسجلة
                  </h3>

                  {/* Active deans */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                        Comptes Actifs (Actifs dans le système)
                      </h4>
                      {deansList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucun compte actif</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                                <th className="pb-2">ID</th>
                                <th className="pb-2">Nom (FR)</th>
                                <th className="pb-2">Faculté</th>
                                <th className="pb-2">Rôle</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {deansList.map((d, i) => (
                                <tr key={i} className="text-slate-700 dark:text-slate-300">
                                  <td className="py-2 font-semibold font-mono">{d.university_id}</td>
                                  <td className="py-2">{d.name_fr}</td>
                                  <td className="py-2">{d.faculties?.name_fr}</td>
                                  <td className="py-2 font-bold uppercase text-[10px] text-indigo-500">{d.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Pending deans */}
                    <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2 animate-pulse" />
                        Comptes en Attente d'Activation (Staging)
                      </h4>
                      {pendingDeansList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucun compte en attente</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                                <th className="pb-2">ID</th>
                                <th className="pb-2">Nom (FR)</th>
                                <th className="pb-2">Faculté</th>
                                <th className="pb-2">Rôle</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {pendingDeansList.map((d, i) => (
                                <tr key={i} className="text-slate-700 dark:text-slate-300">
                                  <td className="py-2 font-semibold font-mono">{d.university_id}</td>
                                  <td className="py-2">{d.name_fr}</td>
                                  <td className="py-2">{d.faculties?.name_fr}</td>
                                  <td className="py-2 font-bold uppercase text-[10px] text-amber-500">{d.role}</td>
                                </tr>
                              ))}
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
            <div className="max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Modifier le Mot de Passe / تغيير كلمة المرور</span>
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nouveau Mot de Passe / كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirmer le Mot de Passe / تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le Mot de Passe'}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};
