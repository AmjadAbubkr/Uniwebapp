import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LangToggle } from './LangToggle';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, LogOut, Plus, KeyRound,
  ShieldAlert, Activity, Upload, BookOpen, TrendingUp,
  Megaphone, Users, GraduationCap, FileSpreadsheet,
  Trash2, Pencil, Check, X
} from 'lucide-react';

interface SubjectRow {
  id: string;
  name_ar: string;
  name_fr: string;
  unit_name_ar: string;
  unit_name_fr: string;
  credits: number;
  teacher_id: string | null;
  section: string;
  level: string;
  semester: number;
  profiles?: { name_fr: string } | null;
}

interface TeacherOption {
  id: string;
  name_fr: string;
  name_ar: string;
}

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const DeanDashboard: React.FC = () => {
  const { logout, profile } = useAuth();
  const { t } = useLang();
  const [pageKey, setPageKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'csv' | 'curriculum' | 'promotion' | 'announcements' | 'profile'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const facultyId = profile?.faculty_id;

  const clearMessages = () => { setError(null); setSuccess(null); };

  // Increment pageKey to trigger page transition animation on tab switch
  useEffect(() => {
    setPageKey(k => k + 1);
  }, [activeTab]);

  useEffect(() => { clearMessages(); }, [activeTab]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) { setError(err.message || 'Error updating password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white safe-top">
      <aside className="hidden lg:flex w-64 bg-[#092a1e] text-[#f3fcf6] flex flex-col justify-between shrink-0 shadow-xl border-r border-[#074d31]">
        <div>
          <div className="p-6 border-b border-[#074d31] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#067647] rounded-lg flex items-center justify-center font-bold text-white shadow-md">KF</div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-[#1b8354] font-semibold uppercase">Dean Panel</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: LayoutDashboard, label: t('Tableau de Bord', 'الرئيسية') },
              { key: 'csv', icon: Upload, label: t('CSV Uploader', 'رفع الملفات') },
              { key: 'curriculum', icon: BookOpen, label: t('Curriculum', 'المنهج') },
              { key: 'promotion', icon: TrendingUp, label: t('Promotion', 'الترقية') },
              { key: 'announcements', icon: Megaphone, label: t('Annonces', 'الإعلانات') },
              { key: 'profile', icon: KeyRound, label: t('Profil', 'الملف الشخصي') },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-[#067647] text-white shadow-lg'
                    : 'text-[#1b8354] hover:bg-[#074d31] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#074d31] space-y-3">
          <div className="px-4 py-3 bg-[#074d31]/50 rounded-lg flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#067647]/20 text-[#1b8354] flex items-center justify-center font-bold">D</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Dean'}</p>
              <span className="text-[10px] text-[#1b8354] uppercase font-semibold">{profile?.role === 'dean' ? 'Doyen' : 'Assistant Doyen'}</span>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-sm font-semibold cursor-pointer transition-all">
            <LogOut className="w-5 h-5" />
            <span>{t('Déconnexion', 'خروج')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        <header className="h-20 bg-white border-b border-[#f3fcf6] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-extrabold text-[#000000]">
              {activeTab === 'home' && t('Tableau de Bord', 'لوحة التحكم')}
              {activeTab === 'csv' && t('CSV Uploader', 'رفع ملف الطلاب')}
              {activeTab === 'curriculum' && t('Gestion du Curriculum', 'إدارة المنهج')}
              {activeTab === 'promotion' && t('Gestion des Promotions', 'إدارة الترقيات')}
              {activeTab === 'announcements' && t('Annonces', 'الإعلانات')}
              {activeTab === 'profile' && t('Paramètres du Profil', 'إعدادات الحساب')}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-md flex items-start space-x-2 text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-[#f3fcf6] border-l-4 border-[#067647] rounded-r-md flex items-start space-x-2 text-[#074d31] text-sm">
              <Activity className="w-5 h-5 shrink-0" /><span>{success}</span>
            </div>
          )}

          <div key={pageKey} className="animate-page-in">
          {activeTab === 'home' && <DeanHome facultyId={facultyId!} />}
          {activeTab === 'csv' && <CSVUploader facultyId={facultyId!} />}
          {activeTab === 'curriculum' && <CurriculumManager facultyId={facultyId!} />}
          {activeTab === 'promotion' && <PromotionManager facultyId={facultyId!} />}
          {activeTab === 'announcements' && <AnnouncementsManager facultyId={facultyId!} profileId={profile?.id!} />}
          {activeTab === 'profile' && (
            <div className="max-w-md space-y-6">
              <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
                <h3 className="text-sm font-bold text-[#000000] mb-4 uppercase tracking-wider">
                  {t('Langue / اللغة', 'اللغة')}
                </h3>
                <LangToggle />
              </div>
              <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-8">
                <h3 className="text-lg font-bold text-[#000000] mb-6 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-[#067647]" />
                  <span>{t('Modifier le Mot de Passe', 'تغيير كلمة المرور')}</span>
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">{t('Nouveau Mot de Passe', 'كلمة المرور الجديدة')}</label>
                    <input type="password" required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">{t('Confirmer le Mot de Passe', 'تأكيد كلمة المرور')}</label>
                    <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all">
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
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50 flex justify-around items-center bg-white/95 backdrop-blur-md border border-[#f3fcf6] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-2xl h-16 max-w-[95vw] sm:max-w-md px-2 overflow-hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)', width: 'stretch' }}
      >
        {[
          { key: 'home', icon: LayoutDashboard, label: 'الرئيسية' },
          { key: 'csv', icon: Upload, label: 'رفع' },
          { key: 'curriculum', icon: BookOpen, label: 'المنهج' },
          { key: 'promotion', icon: TrendingUp, label: 'ترقية' },
          { key: 'announcements', icon: Megaphone, label: 'إعلانات' },
          { key: 'profile', icon: KeyRound, label: 'الملف' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className="relative flex flex-col items-center justify-center w-full h-full rounded-lg transition-all cursor-pointer"
          >
            <Icon className={`w-4 h-4 transition-colors ${activeTab === key ? 'text-[#067647]' : 'text-[#666666]'}`} />
            <span className={`text-[8px] mt-0.5 leading-tight ${activeTab === key ? 'text-[#067647] font-semibold' : 'text-[#666666]'}`}>
              {label}
            </span>
            {activeTab === key && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-[#067647] rounded-full" />
            )}
          </button>
        ))}
      </nav>

    </div>
  );
};

const DeanHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
  const [stats, setStats] = useState({ teachers: 0, students: 0, subjects: 0, announcements: 0 });
  const [avgData, setAvgData] = useState<{ label: string; avg: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const { count: tc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('faculty_id', facultyId).eq('role', 'teacher');
      const { count: sc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('faculty_id', facultyId).eq('role', 'student');
      const { count: subc } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('faculty_id', facultyId);
      const { count: anc } = await supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('faculty_id', facultyId);
      setStats({ teachers: tc || 0, students: sc || 0, subjects: subc || 0, announcements: anc || 0 });

      const { data: subjects } = await supabase.from('subjects').select('id, name_fr').eq('faculty_id', facultyId);
      if (subjects && subjects.length > 0) {
        const chartData = await Promise.all(subjects.map(async (s: any) => {
          const { data: enrolls } = await supabase.from('enrollments').select('subject_average').eq('subject_id', s.id).not('subject_average', 'is', null);
          const vals = (enrolls || []).map((e: any) => Number(e.subject_average)).filter(v => !isNaN(v));
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          return { label: s.name_fr.substring(0, 20), avg: Math.round(avg * 100) / 100 };
        }));
        setAvgData(chartData);
      }
    };
    load();
  }, [facultyId]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('Enseignants', 'الأساتذة'), value: stats.teachers, Icon: Users },
          { label: t('Étudiants', 'الطلاب'), value: stats.students, Icon: GraduationCap },
          { label: t('Matières', 'المواد'), value: stats.subjects, Icon: BookOpen },
          { label: t('Annonces', 'الإعلانات'), value: stats.announcements, Icon: Megaphone },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="bg-white p-6 rounded-lg border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-black text-[#000000] mt-2">{value}</h3>
              </div>
              <div className="w-12 h-12 bg-[#f3fcf6] rounded-lg flex items-center justify-center text-[#067647]">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#000000] mb-6 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#067647]" />
          <span>{t('Moyennes par Matière', 'المعدلات حسب المادة')}</span>
        </h3>
        {avgData.length === 0 ? (
          <p className="text-sm text-[#666666] text-center py-8">{t('Aucune donnée de notes disponible', 'لا توجد بيانات درجات')}</p>
        ) : (
          <div className="space-y-3">
            {avgData.map((d, i) => (
              <div key={i} className="flex items-center space-x-4">
                <span className="text-xs font-medium text-[#666666] w-40 truncate">{d.label}</span>
                <div className="flex-1 h-8 bg-[#f3fcf6] rounded-md overflow-hidden">
                  <div className="h-full bg-[#067647] rounded-md flex items-center px-3 transition-all duration-500" style={{ width: `${(d.avg / 20) * 100}%` }}>
                    <span className="text-xs font-bold text-white">{d.avg.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CSVUploader: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ inserted: number; skipped: number; errors: string[] }>({ inserted: 0, skipped: 0, errors: [] });

  // Manual form state
  const [manualLoading, setManualLoading] = useState(false);
  const [mUniId, setMUniId] = useState('');
  const [mNameAr, setMNameAr] = useState('');
  const [mNameFr, setMNameFr] = useState('');
  const [mRole, setMRole] = useState<'student' | 'teacher'>('student');
  const [mSection, setMSection] = useState('');
  const [mLevel, setMLevel] = useState('');
  const [mDepartment, setMDepartment] = useState('');
  const [mDob, setMDob] = useState('');
  const [mPob, setMPob] = useState('');
  const [manualResult, setManualResult] = useState<string | null>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEditValues, setUserEditValues] = useState<any>({});
  const [usersFilter, setUsersFilter] = useState<'all' | 'student' | 'teacher'>('all');

  const loadUsers = async () => {
    setUsersLoading(true);
    const query = supabase.from('profiles').select('*').eq('faculty_id', facultyId).in('role', ['student', 'teacher']).order('role').order('name_fr');
    const { data } = await query;
    setUsersList(data || []);
    setUsersLoading(false);
  };

  useEffect(() => { loadUsers(); }, [facultyId]);

  const startEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserEditValues({
      name_fr: u.name_fr,
      name_ar: u.name_ar,
      department: u.department || '',
      section: u.section || '',
      level: u.level || '',
      date_of_birth: u.date_of_birth || '',
      place_of_birth: u.place_of_birth || '',
    });
  };

  const cancelEditUser = () => { setEditingUserId(null); setUserEditValues({}); };

  const saveEditUser = async () => {
    if (!editingUserId) return;
    const payload: any = {
      name_fr: userEditValues.name_fr,
      name_ar: userEditValues.name_ar,
      department: userEditValues.department || null,
      section: userEditValues.section || null,
      level: userEditValues.level || null,
      date_of_birth: userEditValues.date_of_birth || null,
      place_of_birth: userEditValues.place_of_birth || null,
    };
    const { error } = await supabase.from('profiles').update(payload).eq('id', editingUserId);
    if (!error) { cancelEditUser(); loadUsers(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResults({ inserted: 0, skipped: 0, errors: [] });
    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) { setLoading(false); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['university_id', 'name_ar', 'name_fr', 'role'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) { setLoading(false); return; }

      const idIdx = headers.indexOf('university_id');
      const arIdx = headers.indexOf('name_ar');
      const frIdx = headers.indexOf('name_fr');
      const roleIdx = headers.indexOf('role');
      const secIdx = headers.indexOf('section');
      const lvlIdx = headers.indexOf('level');
      const deptIdx = headers.indexOf('department');
      const dobIdx = headers.indexOf('date_of_birth');
      const pobIdx = headers.indexOf('place_of_birth');

      let inserted = 0;
      let skipped = 0;
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const uniId = cols[idIdx]?.toLowerCase();
        const role = cols[roleIdx]?.toLowerCase();

        if (!uniId || !role) { errs.push(`Row ${i + 1}: Missing university_id or role`); continue; }
        if (!['student', 'teacher', 'dean', 'assistant_dean'].includes(role)) { errs.push(`Row ${i + 1}: Invalid role "${role}"`); continue; }

        const { data: existingProfile } = await supabase.from('profiles').select('university_id').eq('university_id', uniId).maybeSingle();
        if (existingProfile) { skipped++; continue; }

        const { data: existingPending } = await supabase.from('pending_users').select('university_id').eq('university_id', uniId).maybeSingle();
        if (existingPending) { skipped++; continue; }

        const row: any = {
          university_id: uniId,
          name_ar: cols[arIdx] || '',
          name_fr: cols[frIdx] || '',
          role,
          faculty_id: facultyId,
          section: secIdx >= 0 ? cols[secIdx] || null : null,
          level: lvlIdx >= 0 ? cols[lvlIdx] || null : null,
          department: deptIdx >= 0 ? cols[deptIdx] || null : null,
          date_of_birth: dobIdx >= 0 && cols[dobIdx] ? cols[dobIdx] : null,
          place_of_birth: pobIdx >= 0 ? cols[pobIdx] || null : null,
        };

        const { error: insertError } = await supabase.from('pending_users').insert(row);
        if (insertError) { errs.push(`Row ${i + 1}: ${insertError.message}`); } else { inserted++; }
      }

      setResults({ inserted, skipped, errors: errs });
    } catch (_err: any) { /* results will show errors */ }
    finally { setLoading(false); e.target.value = ''; }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualResult(null);
    setManualLoading(true);
    const uniId = mUniId.trim().toLowerCase();
    try {
      const { data: ep } = await supabase.from('profiles').select('university_id').eq('university_id', uniId).maybeSingle();
      if (ep) { setManualResult('error:This ID already has an active account.'); return; }

      const { data: epen } = await supabase.from('pending_users').select('university_id').eq('university_id', uniId).maybeSingle();
      if (epen) { setManualResult('error:This ID is already pending activation.'); return; }

      const { error: insertError } = await supabase.from('pending_users').insert({
        university_id: uniId,
        name_ar: mNameAr.trim(),
        name_fr: mNameFr.trim(),
        role: mRole,
        faculty_id: facultyId,
        section: mSection.trim() || null,
        level: mLevel.trim() || null,
        department: mDepartment.trim() || null,
        date_of_birth: mDob || null,
        place_of_birth: mPob.trim() || null,
      });
      if (insertError) throw insertError;

      setManualResult('success:User registered. They can now activate via the login page.');
      setMUniId(''); setMNameAr(''); setMNameFr('');
      setMSection(''); setMLevel(''); setMDepartment(''); setMDob(''); setMPob('');
    } catch (err: any) {
      setManualResult(`error:${err.message}`);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CSV upload card */}
        <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-8">
          <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-[#067647]" />
            <span>{t('Importer CSV', 'رفع ملف CSV')}</span>
          </h3>
          <p className="text-sm text-[#666666] mb-4">
            Required: <code className="bg-[#f3fcf6] px-2 py-0.5 rounded text-xs">university_id, name_ar, name_fr, role</code>
            <br />Optional: <code className="bg-[#f3fcf6] px-2 py-0.5 rounded text-xs">section, level, department, date_of_birth, place_of_birth</code>
          </p>
          <div className="border-2 border-dashed border-[#d2d6db] rounded-lg p-8 text-center hover:border-[#067647] transition-colors">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-[#666666] mb-4" />
            <label className="cursor-pointer">
              <span className="px-6 py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md shadow-md inline-block transition-all">
                {loading ? 'Traitement...' : 'Sélectionner le fichier CSV'}
              </span>
              <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} className="hidden" />
            </label>
            <p className="text-xs text-[#666666] mt-3">Les lignes en double seront ignorées automatiquement</p>
          </div>
          {(results.inserted > 0 || results.skipped > 0) && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#f3fcf6] rounded-md text-center">
                  <p className="text-2xl font-black text-[#067647]">{results.inserted}</p>
                  <p className="text-xs text-[#074d31] font-semibold">{t('Insérés', 'مسجلون')}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-md text-center">
                  <p className="text-2xl font-black text-amber-600">{results.skipped}</p>
                  <p className="text-xs text-amber-700 font-semibold">{t('Ignorés', 'متجاهلون')}</p>
                </div>
              </div>
              {results.errors.length > 0 && (
                <div className="p-3 bg-rose-50 rounded-md">
                  {results.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-xs text-rose-500">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual form card */}
        <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-8">
          <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-[#067647]" />
            <span>{t('Ajouter Manuellement', 'يدوي')}</span>
          </h3>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">ID Universitaire *</label>
              <input required type="text" value={mUniId} onChange={e => setMUniId(e.target.value)} placeholder="Ex: 20260042" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Rôle *</label>
              <select required value={mRole} onChange={e => setMRole(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden">
                <option value="student">{t('Étudiant', 'طالب')}</option>
                <option value="teacher">{t('Enseignant', 'أستاذ')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Nom (FR) *</label>
              <input required type="text" value={mNameFr} onChange={e => setMNameFr(e.target.value)} placeholder="Ex: Ahmed Mohamed" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1 text-right">الاسم (AR) *</label>
              <input required type="text" value={mNameAr} onChange={e => setMNameAr(e.target.value)} placeholder="مثال: أحمد محمد" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] text-right focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Section</label>
              <input type="text" value={mSection} onChange={e => setMSection(e.target.value)} placeholder="Ex: Génie Informatique" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Niveau</label>
              <input type="text" value={mLevel} onChange={e => setMLevel(e.target.value)} placeholder="Ex: 4eme Annee" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Département</label>
              <input type="text" value={mDepartment} onChange={e => setMDepartment(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Date de Naissance</label>
              <input type="date" value={mDob} onChange={e => setMDob(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Lieu de Naissance</label>
              <input type="text" value={mPob} onChange={e => setMPob(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            {manualResult && (
              <div className={`p-3 rounded-md text-sm font-semibold ${manualResult.startsWith('success') ? 'bg-[#f3fcf6] text-[#074d31]' : 'bg-rose-50 text-rose-700'}`}>
                {manualResult.split(':').slice(1).join(':')}
              </div>
            )}
            <button type="submit" disabled={manualLoading} className="w-full py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all">
              {manualLoading ? t('Enregistrement...', 'تسجيل...') : t('Enregistrer', 'تسجيل')}
            </button>
          </form>
        </div>

      </div>

      <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-[#000000]">
            Utilisateurs Enregistrés ({usersList.length})
          </h3>
          <div className="flex space-x-2">
            {(['all', 'student', 'teacher'] as const).map(f => (
              <button key={f} onClick={() => setUsersFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${usersFilter === f ? 'bg-[#067647] text-white' : 'bg-[#f3fcf6] text-[#666666]'}`}>
                {f === 'all' ? 'Tous' : f === 'student' ? 'Étudiants' : 'Enseignants'}
              </button>
            ))}
          </div>
        </div>
        {usersLoading ? (
          <p className="text-xs text-[#666666] text-center py-4">Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#f3fcf6] text-[#666666] font-bold">
                  <th className="pb-2 pr-3">ID</th>
                  <th className="pb-2 pr-3">Nom (FR)</th>
                  <th className="pb-2 pr-3">الاسم (AR)</th>
                  <th className="pb-2 pr-3">Rôle</th>
                  <th className="pb-2 pr-3">Section</th>
                  <th className="pb-2 pr-3">Niveau</th>
                  <th className="pb-2 pr-3">Département</th>
                  <th className="pb-2 pr-3">D.Naiss</th>
                  <th className="pb-2 pr-3">L.Naiss</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3fcf6]">
                {usersList
                  .filter(u => usersFilter === 'all' || u.role === usersFilter)
                  .map(u => {
                    const isEditing = editingUserId === u.id;
                    return (
                      <tr key={u.id} className="text-[#000000] hover:bg-[#f3fcf6]">
                        <td className="py-2 pr-3 font-mono font-semibold">{u.university_id}</td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.name_fr} onChange={e => setUserEditValues((p: any) => ({ ...p, name_fr: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.name_fr}
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.name_ar} onChange={e => setUserEditValues((p: any) => ({ ...p, name_ar: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs text-right focus:outline-none" />
                          ) : u.name_ar}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`font-bold uppercase text-[10px] ${u.role === 'student' ? 'text-[#067647]' : 'text-blue-600'}`}>{u.role}</span>
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.section} onChange={e => setUserEditValues((p: any) => ({ ...p, section: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.section || '\u2014'}
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.level} onChange={e => setUserEditValues((p: any) => ({ ...p, level: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.level || '\u2014'}
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.department} onChange={e => setUserEditValues((p: any) => ({ ...p, department: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.department || '\u2014'}
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input type="date" value={userEditValues.date_of_birth} onChange={e => setUserEditValues((p: any) => ({ ...p, date_of_birth: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString() : '\u2014'}
                        </td>
                        <td className="py-2 pr-3">
                          {isEditing ? (
                            <input value={userEditValues.place_of_birth} onChange={e => setUserEditValues((p: any) => ({ ...p, place_of_birth: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                          ) : u.place_of_birth || '\u2014'}
                        </td>
                        <td className="py-2">
                          {isEditing ? (
                            <div className="flex space-x-1">
                              <button onClick={saveEditUser} className="text-[#067647] hover:text-[#074d31] cursor-pointer"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditUser} className="text-rose-500 hover:text-rose-700 cursor-pointer"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => startEditUser(u)} className="text-[#666666] hover:text-[#067647] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {usersList.filter(u => usersFilter === 'all' || u.role === usersFilter).length === 0 && (
              <p className="text-xs text-[#666666] text-center py-6">Aucun utilisateur</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CurriculumManager: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [unitNameAr, setUnitNameAr] = useState('');
  const [unitNameFr, setUnitNameFr] = useState('');
  const [credits, setCredits] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [section, setSection] = useState('');
  const [level, setLevel] = useState('');
  const [semester, setSemester] = useState<'1' | '2'>('1');

  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResults, setCsvResults] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  const loadData = useCallback(async () => {
    const { data: subs } = await supabase.from('subjects').select('*, profiles(name_fr, name_ar)').eq('faculty_id', facultyId).order('name_fr');
    setSubjects(subs || []);
    const { data: tchrs } = await supabase.from('profiles').select('id, name_fr, name_ar').eq('faculty_id', facultyId).eq('role', 'teacher').eq('status', 'active');
    setTeachers(tchrs || []);
  }, [facultyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameFr.trim() || !unitNameAr.trim() || !unitNameFr.trim() || !credits || !section.trim() || !level.trim()) {
      return;
    }
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('subjects').insert({
        faculty_id: facultyId,
        name_ar: nameAr.trim(),
        name_fr: nameFr.trim(),
        unit_name_ar: unitNameAr.trim(),
        unit_name_fr: unitNameFr.trim(),
        credits: parseFloat(credits),
        teacher_id: teacherId || null,
        section: section.trim(),
        level: level.trim(),
        semester: parseInt(semester),
      });
      if (insertError) throw insertError;
      setNameAr(''); setNameFr(''); setUnitNameAr(''); setUnitNameFr(''); setCredits(''); setTeacherId(''); setSection(''); setLevel('');
      loadData();
    } catch (_err: any) { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject and all its enrollments?')) return;
    await supabase.from('subjects').delete().eq('id', id);
    loadData();
  };

  const handleAssignTeacher = async (subjectId: string, tid: string) => {
    if (tid && !teachers.some(t => t.id === tid)) return;
    await supabase.from('subjects').update({ teacher_id: tid || null }).eq('id', subjectId);
    loadData();
  };

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectEditValues, setSubjectEditValues] = useState<any>({});

  const startEditSubject = (s: SubjectRow) => {
    setEditingSubjectId(s.id);
    setSubjectEditValues({
      name_fr: s.name_fr,
      name_ar: s.name_ar,
      unit_name_fr: s.unit_name_fr,
      unit_name_ar: s.unit_name_ar,
      credits: s.credits,
      section: s.section,
      level: s.level,
      semester: s.semester,
      teacher_id: s.teacher_id || '',
    });
  };

  const cancelEditSubject = () => { setEditingSubjectId(null); setSubjectEditValues({}); };

  const saveEditSubject = async () => {
    if (!editingSubjectId) return;
    const tid = subjectEditValues.teacher_id;
    if (tid && !teachers.some(t => t.id === tid)) return;
    const { error } = await supabase.from('subjects').update({
      ...subjectEditValues,
      credits: parseFloat(subjectEditValues.credits),
      semester: parseInt(subjectEditValues.semester),
      teacher_id: tid || null,
    }).eq('id', editingSubjectId);
    if (!error) { cancelEditSubject(); loadData(); }
  };

  const handleSubjectCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvResults(null);
    setCsvLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) { setCsvLoading(false); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['name_ar', 'name_fr', 'unit_name_ar', 'unit_name_fr', 'credits', 'section', 'level', 'semester'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setCsvResults({ inserted: 0, skipped: 0, errors: [`Missing columns: ${missing.join(', ')}`] });
        setCsvLoading(false);
        return;
      }

      const idx = (col: string) => headers.indexOf(col);

      let inserted = 0, skipped = 0;
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const nameFr = cols[idx('name_fr')];
        const nameAr = cols[idx('name_ar')];
        const semester = parseInt(cols[idx('semester')]);

        if (!nameFr || !nameAr) { errs.push(`Row ${i + 1}: Missing name_ar or name_fr`); continue; }
        if (![1, 2].includes(semester)) { errs.push(`Row ${i + 1}: semester must be 1 or 2`); continue; }

        const credits = parseFloat(cols[idx('credits')]);
        if (isNaN(credits) || credits <= 0) { errs.push(`Row ${i + 1}: Invalid credits value`); continue; }

        const teacherCol = idx('teacher_id');
        const csvTeacherId = teacherCol >= 0 && cols[teacherCol] ? cols[teacherCol] : null;
        if (csvTeacherId && !teachers.some(t => t.id === csvTeacherId)) {
          errs.push(`Row ${i + 1}: teacher_id not in your faculty`);
          continue;
        }

        const { error: insertError } = await supabase.from('subjects').insert({
          faculty_id: facultyId,
          name_ar: nameAr,
          name_fr: nameFr,
          unit_name_ar: cols[idx('unit_name_ar')] || '',
          unit_name_fr: cols[idx('unit_name_fr')] || '',
          credits,
          section: cols[idx('section')] || '',
          level: cols[idx('level')] || '',
          semester,
          teacher_id: csvTeacherId,
        });

        if (insertError) { errs.push(`Row ${i + 1}: ${insertError.message}`); } else { inserted++; }
      }

      setCsvResults({ inserted, skipped, errors: errs });
      if (inserted > 0) loadData();
    } catch (_err: any) { /* ignore */ }
    finally { setCsvLoading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Existing manual form card */}
        <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-[#067647]" />
            <span>{t('Créer une Matière', 'إنشاء مادة')}</span>
          </h3>
          <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Nom (FR) *</label>
              <input type="text" required value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">الاسم (AR) *</label>
              <input type="text" required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-right text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Unité (FR) *</label>
              <input type="text" required value={unitNameFr} onChange={e => setUnitNameFr(e.target.value)} placeholder="Ex: Unité 1" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">الوحدة (AR) *</label>
              <input type="text" required value={unitNameAr} onChange={e => setUnitNameAr(e.target.value)} placeholder="مثال: الوحدة الأولى" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-right text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Crédits *</label>
              <input type="number" required step="0.01" min="0.01" value={credits} onChange={e => setCredits(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Enseignant</label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden">
                <option value="">{t('Aucun', 'بدون أستاذ')}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name_fr}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Section *</label>
              <input type="text" required value={section} onChange={e => setSection(e.target.value)} placeholder="Ex: Génie Informatique" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Niveau *</label>
              <input type="text" required value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex: 4ème Année" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Semestre *</label>
              <select value={semester} onChange={e => setSemester(e.target.value as '1' | '2')} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden">
                <option value="1">Semestre 1</option>
                <option value="2">Semestre 2</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 mt-2">
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all">
                {loading ? 'Création...' : 'Créer la Matière'}
              </button>
            </div>
          </form>
        </div>

        {/* New CSV upload card */}
        <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#067647]" />
            <span>{t('Importer Matières CSV', 'رفع ملف')}</span>
          </h3>
          <p className="text-sm text-[#666666] mb-2">
            Required: <code className="bg-[#f3fcf6] px-2 py-0.5 rounded text-xs">name_ar, name_fr, unit_name_ar, unit_name_fr, credits, section, level, semester</code>
          </p>
          <p className="text-sm text-[#666666] mb-4">
            Optional: <code className="bg-[#f3fcf6] px-2 py-0.5 rounded text-xs">teacher_id</code>
          </p>
          <p className="text-xs text-[#666666] mb-4">semester must be <code className="bg-[#f3fcf6] px-1 rounded">1</code> or <code className="bg-[#f3fcf6] px-1 rounded">2</code>. teacher_id must be a valid profile UUID.</p>
          <div className="border-2 border-dashed border-[#d2d6db] rounded-lg p-8 text-center hover:border-[#067647] transition-colors">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-[#666666] mb-4" />
            <label className="cursor-pointer">
              <span className="px-6 py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md shadow-md inline-block transition-all">
                {csvLoading ? 'Traitement...' : 'Sélectionner CSV'}
              </span>
              <input type="file" accept=".csv" onChange={handleSubjectCsvUpload} disabled={csvLoading} className="hidden" />
            </label>
          </div>
          {csvResults && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#f3fcf6] rounded-md text-center">
                  <p className="text-2xl font-black text-[#067647]">{csvResults.inserted}</p>
                  <p className="text-xs text-[#074d31] font-semibold">Insérés</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-md text-center">
                  <p className="text-2xl font-black text-amber-600">{csvResults.skipped}</p>
                  <p className="text-xs text-amber-700 font-semibold">Ignorés</p>
                </div>
              </div>
              {csvResults.errors.length > 0 && (
                <div className="p-3 bg-rose-50 rounded-md">
                  {csvResults.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-xs text-rose-500">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
        <h3 className="text-md font-bold text-[#000000] mb-4">Matières Existantes ({subjects.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#f3fcf6] text-[#666666] font-bold">
                <th className="pb-2">Matière (FR)</th>
                <th className="pb-2">المادة (AR)</th>
                <th className="pb-2">Unité</th>
                <th className="pb-2">Crédits</th>
                <th className="pb-2">Enseignant</th>
                <th className="pb-2">Section</th>
                <th className="pb-2">Niveau</th>
                <th className="pb-2">S</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3fcf6]">
              {subjects.map(s => {
                const isEditing = editingSubjectId === s.id;
                return (
                  <tr key={s.id} className="text-[#000000]">
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input value={subjectEditValues.name_fr} onChange={e => setSubjectEditValues((p: any) => ({ ...p, name_fr: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                      ) : <span className="font-semibold">{s.name_fr}</span>}
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input value={subjectEditValues.name_ar} onChange={e => setSubjectEditValues((p: any) => ({ ...p, name_ar: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs text-right focus:outline-none" />
                      ) : s.name_ar}
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input value={subjectEditValues.unit_name_fr} onChange={e => setSubjectEditValues((p: any) => ({ ...p, unit_name_fr: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                      ) : s.unit_name_fr}
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input type="number" step="0.01" min="0.01" value={subjectEditValues.credits} onChange={e => setSubjectEditValues((p: any) => ({ ...p, credits: e.target.value }))} className="w-16 px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                      ) : s.credits}
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={isEditing ? subjectEditValues.teacher_id : (s.teacher_id || '')}
                        onChange={e => isEditing
                          ? setSubjectEditValues((p: any) => ({ ...p, teacher_id: e.target.value }))
                          : handleAssignTeacher(s.id, e.target.value)
                        }
                        className="w-full px-2 py-1 bg-white border border-[#d2d6db] rounded text-xs text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#067647]/20 focus:border-[#067647]"
                      >
                        <option value="">—</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name_fr}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input value={subjectEditValues.section} onChange={e => setSubjectEditValues((p: any) => ({ ...p, section: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                      ) : s.section}
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <input value={subjectEditValues.level} onChange={e => setSubjectEditValues((p: any) => ({ ...p, level: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none" />
                      ) : s.level}
                    </td>
                    <td className="py-2 pr-2">
                      {isEditing ? (
                        <select value={subjectEditValues.semester} onChange={e => setSubjectEditValues((p: any) => ({ ...p, semester: e.target.value }))} className="w-full px-2 py-1 border border-[#067647] rounded text-xs focus:outline-none">
                          <option value="1">S1</option>
                          <option value="2">S2</option>
                        </select>
                      ) : `S${s.semester}`}
                    </td>
                    <td className="py-2">
                      <div className="flex space-x-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEditSubject} className="text-[#067647] hover:text-[#074d31] cursor-pointer"><Check className="w-4 h-4" /></button>
                            <button onClick={cancelEditSubject} className="text-rose-500 hover:text-rose-700 cursor-pointer"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditSubject(s)} className="text-[#666666] hover:text-[#067647] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteSubject(s.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PromotionManager: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('section, level').eq('faculty_id', facultyId).eq('role', 'student').eq('status', 'active');
      const all = data || [];
      setSections([...new Set(all.map((s: any) => s.section).filter(Boolean))].sort());
      setLevels([...new Set(all.map((s: any) => s.level).filter(Boolean))].sort());
    };
    load();
  }, [facultyId]);

  const searchStudents = async () => {
    if (!selectedSection || !selectedLevel) return;
    const { data } = await supabase.from('profiles').select('*').eq('faculty_id', facultyId).eq('role', 'student').eq('section', selectedSection).eq('level', selectedLevel).eq('status', 'active');
    setStudents(data || []);
    setSelectedIds(new Set());
  };

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handlePromote = async () => {
    if (!newLevel.trim() || selectedIds.size === 0) { return; }
    setLoading(true);
    try {
      const ids = Array.from(selectedIds);
      const { error: updateError } = await supabase.from('profiles').update({ level: newLevel.trim() }).in('id', ids);
      if (updateError) throw updateError;
      searchStudents();
    } catch (_err: any) { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#067647]" />
          <span>{t('Promotion des Étudiants', 'ترقية الطلاب')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden">
              <option value="">Sélectionner</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">Niveau Actuel</label>
            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden">
              <option value="">Sélectionner</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={searchStudents} className="w-full py-2.5 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer transition-all">
              {t('Rechercher', 'بحث')}
            </button>
          </div>
        </div>

        {students.length > 0 && (
          <>
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#666666] uppercase mb-1">{t('Nouveau Niveau', 'المستوى الجديد')} *</label>
                <input type="text" value={newLevel} onChange={e => setNewLevel(e.target.value)} placeholder="Ex: 5ème Année" className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
              </div>
              <div className="pt-5">
                <button onClick={handlePromote} disabled={loading} className="px-6 py-2.5 bg-[#1b8354] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer transition-all">
                  {loading ? 'Promotion...' : `Promouvoir (${selectedIds.size})`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#f3fcf6] rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f3fcf6]">
                  <tr className="text-[#666666] font-bold">
                    <th className="p-3"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(new Set(students.map(s => s.id))); else setSelectedIds(new Set()); }} checked={selectedIds.size === students.length && students.length > 0} /></th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nom (FR)</th>
                    <th className="p-3">الاسم (AR)</th>
                    <th className="p-3">Niveau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3fcf6]">
                  {students.map(s => (
                    <tr key={s.id} className="text-[#000000] hover:bg-[#f3fcf6]">
                      <td className="p-3"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleStudent(s.id)} /></td>
                      <td className="p-3 font-mono font-semibold">{s.university_id}</td>
                      <td className="p-3">{s.name_fr}</td>
                      <td className="p-3 text-right">{s.name_ar}</td>
                      <td className="p-3">{s.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AnnouncementsManager: React.FC<{ facultyId: string; profileId: string }> = ({ facultyId, profileId }) => {
  const { t } = useLang();
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase.from('announcements').select('*').eq('faculty_id', facultyId).is('subject_id', null).order('created_at', { ascending: false });
    setAnnouncements(data || []);
  }, [facultyId]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await supabase.from('announcements').insert({ author_id: profileId, faculty_id: facultyId, title: title.trim(), content: content.trim() });
    setTitle(''); setContent('');
    loadAnnouncements();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadAnnouncements();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-[#067647]" />
          <span>{t('Nouvelle Annonce', 'إعلان جديد')}</span>
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <input type="text" required placeholder={t('Titre', 'العنوان')} value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden" />
          <textarea required rows={4} placeholder={t('Contenu', 'المحتوى')} value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden resize-none" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all">
            {loading ? t('Publication...', 'نشر...') : t('Publier', 'نشر')}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6 flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-[#000000]">{a.title}</h4>
              <p className="text-xs text-[#666666] mt-1 whitespace-pre-wrap">{a.content}</p>
              <p className="text-[10px] text-[#666666] mt-2">{new Date(a.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-[#666666] text-center py-8">{t('Aucune annonce', 'لا توجد إعلانات')}</p>}
      </div>
    </div>
  );
};
