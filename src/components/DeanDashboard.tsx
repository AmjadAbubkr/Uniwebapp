import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, LogOut, Plus, KeyRound,
  ShieldAlert, Activity, Upload, BookOpen, TrendingUp,
  Megaphone, Users, GraduationCap, FileSpreadsheet,
  Trash2
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
  const [activeTab, setActiveTab] = useState<'home' | 'csv' | 'curriculum' | 'promotion' | 'announcements' | 'profile'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const facultyId = profile?.faculty_id;

  const clearMessages = () => { setError(null); setSuccess(null); };

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">KF</div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-indigo-400 font-semibold uppercase">Dean Panel</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: LayoutDashboard, label: 'Tableau de Bord / الرئيسية' },
              { key: 'csv', icon: Upload, label: 'CSV Uploader / رفع الملفات' },
              { key: 'curriculum', icon: BookOpen, label: 'Curriculum / المنهج' },
              { key: 'promotion', icon: TrendingUp, label: 'Promotion / الترقية' },
              { key: 'announcements', icon: Megaphone, label: 'Annonces / الإعلانات' },
              { key: 'profile', icon: KeyRound, label: 'Profil / الملف الشخصي' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-3 bg-slate-800/50 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">D</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Dean'}</p>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">{profile?.role === 'dean' ? 'Doyen' : 'Assistant Doyen'}</span>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-sm font-semibold cursor-pointer transition-all">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion / خروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-8 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {activeTab === 'home' && 'Tableau de Bord / لوحة التحكم'}
              {activeTab === 'csv' && 'CSV Uploader / رفع ملف الطلاب'}
              {activeTab === 'curriculum' && 'Gestion du Curriculum / إدارة المنهج'}
              {activeTab === 'promotion' && 'Gestion des Promotions / إدارة الترقيات'}
              {activeTab === 'announcements' && 'Annonces / الإعلانات'}
              {activeTab === 'profile' && 'Paramètres du Profil / إعدادات الحساب'}
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-r-xl flex items-start space-x-2 text-rose-800 dark:text-rose-200 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-2 text-emerald-800 dark:text-emerald-200 text-sm">
              <Activity className="w-5 h-5 shrink-0" /><span>{success}</span>
            </div>
          )}

          {activeTab === 'home' && <DeanHome facultyId={facultyId!} />}
          {activeTab === 'csv' && <CSVUploader facultyId={facultyId!} />}
          {activeTab === 'curriculum' && <CurriculumManager facultyId={facultyId!} />}
          {activeTab === 'promotion' && <PromotionManager facultyId={facultyId!} />}
          {activeTab === 'announcements' && <AnnouncementsManager facultyId={facultyId!} profileId={profile?.id!} />}
          {activeTab === 'profile' && (
            <div className="max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Modifier le Mot de Passe / تغيير كلمة المرور</span>
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Nouveau Mot de Passe</label>
                  <input type="password" required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Confirmer le Mot de Passe</label>
                  <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all">
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

const DeanHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
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
          { label: 'Enseignants / الأساتذة', value: stats.teachers, color: 'indigo', Icon: Users },
          { label: 'Étudiants / الطلاب', value: stats.students, color: 'sky', Icon: GraduationCap },
          { label: 'Matières / المواد', value: stats.subjects, color: 'emerald', Icon: BookOpen },
          { label: 'Annonces / الإعلانات', value: stats.announcements, color: 'amber', Icon: Megaphone },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{value}</h3>
              </div>
              <div className={`w-12 h-12 bg-${color}-50 dark:bg-${color}-950/50 rounded-2xl flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <span>Moyennes par Matière / المعدلات حسب المادة</span>
        </h3>
        {avgData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune donnée de notes disponible / لا توجد بيانات درجات</p>
        ) : (
          <div className="space-y-3">
            {avgData.map((d, i) => (
              <div key={i} className="flex items-center space-x-4">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-40 truncate">{d.label}</span>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-lg flex items-center px-3 transition-all duration-500" style={{ width: `${(d.avg / 20) * 100}%` }}>
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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ inserted: number; skipped: number; errors: string[] }>({ inserted: 0, skipped: 0, errors: [] });

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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-indigo-500" />
          <span>Importer un fichier CSV / رفع ملف CSV</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Required columns: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">university_id, name_ar, name_fr, role</code>
          &nbsp;Optional: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">section, level, department, date_of_birth, place_of_birth</code>
        </p>
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <label className="cursor-pointer">
            <span className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md inline-block transition-all">
              {loading ? 'Traitement en cours...' : 'Sélectionner le fichier CSV'}
            </span>
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} className="hidden" />
          </label>
          <p className="text-xs text-slate-400 mt-3">Les lignes en double seront ignorées automatiquement</p>
        </div>
      </div>

      {(results.inserted > 0 || results.skipped > 0) && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
          <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase mb-3">Résultats de l'importation / نتائج الاستيراد</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
              <p className="text-2xl font-black text-emerald-600">{results.inserted}</p>
              <p className="text-xs text-emerald-700 font-semibold">Insérés / مسجلون</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-center">
              <p className="text-2xl font-black text-amber-600">{results.skipped}</p>
              <p className="text-xs text-amber-700 font-semibold">Ignorés (doublons) / متجاهلون</p>
            </div>
          </div>
          {results.errors.length > 0 && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
              <p className="text-xs font-bold text-rose-600 mb-1">Erreurs ({results.errors.length})</p>
              {results.errors.slice(0, 10).map((err, i) => (
                <p key={i} className="text-xs text-rose-500">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CurriculumManager: React.FC<{ facultyId: string }> = ({ facultyId }) => {
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

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          <span>Créer une Matière / إنشاء مادة</span>
        </h3>
        <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Nom (FR) *</label>
            <input type="text" required value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">الاسم (AR) *</label>
            <input type="text" required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-right text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Unité (FR) *</label>
            <input type="text" required value={unitNameFr} onChange={e => setUnitNameFr(e.target.value)} placeholder="Ex: Unité 1" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">الوحدة (AR) *</label>
            <input type="text" required value={unitNameAr} onChange={e => setUnitNameAr(e.target.value)} placeholder="مثال: الوحدة الأولى" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-right text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Crédits *</label>
            <input type="number" required step="0.01" min="0.01" value={credits} onChange={e => setCredits(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Enseignant</label>
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden">
              <option value="">Aucun / بدون أستاذ</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Section *</label>
            <input type="text" required value={section} onChange={e => setSection(e.target.value)} placeholder="Ex: Génie Informatique" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Niveau *</label>
            <input type="text" required value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex: 4ème Année" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Semestre *</label>
            <select value={semester} onChange={e => setSemester(e.target.value as '1' | '2')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden">
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all">
              {loading ? 'Création...' : 'Créer la Matière'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
        <h3 className="text-md font-bold text-slate-800 dark:text-white mb-4">Matières Existantes ({subjects.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                <th className="pb-2">Matière (FR)</th>
                <th className="pb-2">Unité</th>
                <th className="pb-2">Crédits</th>
                <th className="pb-2">Enseignant</th>
                <th className="pb-2">Section</th>
                <th className="pb-2">Niveau</th>
                <th className="pb-2">S</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map(s => (
                <tr key={s.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2 font-semibold">{s.name_fr}</td>
                  <td className="py-2">{s.unit_name_fr}</td>
                  <td className="py-2">{s.credits}</td>
                  <td className="py-2">{s.profiles?.name_fr || '—'}</td>
                  <td className="py-2">{s.section}</td>
                  <td className="py-2">{s.level}</td>
                  <td className="py-2">S{s.semester}</td>
                  <td className="py-2">
                    <button onClick={() => handleDeleteSubject(s.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PromotionManager: React.FC<{ facultyId: string }> = ({ facultyId }) => {
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
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>Promotion des Étudiants / ترقية الطلاب</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden">
              <option value="">Sélectionner</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Niveau Actuel</label>
            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden">
              <option value="">Sélectionner</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={searchStudents} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-all">
              Rechercher / بحث
            </button>
          </div>
        </div>

        {students.length > 0 && (
          <>
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Nouveau Niveau / المستوى الجديد *</label>
                <input type="text" value={newLevel} onChange={e => setNewLevel(e.target.value)} placeholder="Ex: 5ème Année" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
              </div>
              <div className="pt-5">
                <button onClick={handlePromote} disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-all">
                  {loading ? 'Promotion...' : `Promouvoir (${selectedIds.size})`}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-700/60 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="text-slate-400 font-bold">
                    <th className="p-3"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(new Set(students.map(s => s.id))); else setSelectedIds(new Set()); }} checked={selectedIds.size === students.length && students.length > 0} /></th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nom (FR)</th>
                    <th className="p-3">الاسم (AR)</th>
                    <th className="p-3">Niveau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map(s => (
                    <tr key={s.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50">
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
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          <span>Nouvelle Annonce / إعلان جديد</span>
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <input type="text" required placeholder="Titre / العنوان" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
          <textarea required rows={4} placeholder="Contenu / المحتوى" value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden resize-none" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all">
            {loading ? 'Publication...' : 'Publier / نشر'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6 flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{a.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">{a.content}</p>
              <p className="text-[10px] text-slate-400 mt-2">{new Date(a.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune annonce / لا توجد إعلانات</p>}
      </div>
    </div>
  );
};
