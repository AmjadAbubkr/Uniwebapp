import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Megaphone, GraduationCap, KeyRound, LogOut, ShieldAlert,
  Activity, Printer
} from 'lucide-react';

interface EnrollmentRow {
  id: string;
  classwork: number | null;
  exam_session_1: number | null;
  exam_session_2: number | null;
  subject_average: number | null;
  credits_earned: number;
  subjects: {
    name_ar: string;
    name_fr: string;
    unit_name_ar: string;
    unit_name_fr: string;
    credits: number;
    semester: number;
  } | null;
}

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
  subject_id: string | null;
  subjects?: { name_fr: string } | null;
}

export const StudentDashboard: React.FC = () => {
  const { logout, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'grades' | 'profile'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => { setError(null); setSuccess(null); }, [activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess('Password changed successfully!');
      setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { setError(err.message); }
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
              <span className="text-xs text-indigo-400 font-semibold uppercase">Student Portal</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: Megaphone, label: 'Annonces / الإعلانات' },
              { key: 'grades', icon: GraduationCap, label: 'Notes / الدرجات' },
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
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">S</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Student'}</p>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Étudiant</span>
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
              {activeTab === 'home' && 'Annonces / الإعلانات'}
              {activeTab === 'grades' && 'Relevé de Notes / كشف الدرجات'}
              {activeTab === 'profile' && 'Paramètres du Profil / إعدادات الحساب'}
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-r-xl flex items-start space-x-2 text-rose-800 dark:text-rose-200 text-sm no-print">
              <ShieldAlert className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-2 text-emerald-800 dark:text-emerald-200 text-sm no-print">
              <Activity className="w-5 h-5 shrink-0" /><span>{success}</span>
            </div>
          )}

          {activeTab === 'home' && <StudentHome facultyId={profile?.faculty_id!} />}
          {activeTab === 'grades' && <StudentGrades studentId={profile?.id!} profile={profile!} />}
          {activeTab === 'profile' && (
            <div className="max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Modifier le Mot de Passe / تغيير كلمة المرور</span>
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Nouveau Mot de Passe</label>
                  <input type="password" required placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Confirmer le Mot de Passe</label>
                  <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
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

const StudentHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [facultyRes, subjectRes] = await Promise.all([
        supabase.from('announcements').select('*').eq('faculty_id', facultyId).is('subject_id', null).order('created_at', { ascending: false }),
        supabase.from('announcements').select('*, subjects(name_fr)').not('subject_id', 'is', null).order('created_at', { ascending: false }),
      ]);
      const all = [...(facultyRes.data || []), ...(subjectRes.data || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAnnouncements(all);
    };
    load();
  }, [facultyId]);

  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400">Aucune annonce / لا توجد إعلانات</p>
        </div>
      ) : (
        announcements.map(a => (
          <div key={a.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{a.title}</h4>
                  {a.subjects && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">{a.subjects.name_fr}</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">{a.content}</p>
                <p className="text-[10px] text-slate-400 mt-2">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const StudentGrades: React.FC<{ studentId: string; profile: any }> = ({ studentId, profile }) => {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [facultyName, setFacultyName] = useState({ name_fr: '', name_ar: '' });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, subjects(name_ar, name_fr, unit_name_ar, unit_name_fr, credits, semester)')
        .eq('student_id', studentId)
        .order('subjects(semester)', { ascending: true });

      setEnrollments((data as EnrollmentRow[]) || []);

      if (profile?.faculty_id) {
        const { data: fac } = await supabase.from('faculties').select('name_fr, name_ar').eq('id', profile.faculty_id).single();
        if (fac) setFacultyName(fac as any);
      }
    };
    load();
  }, [studentId, profile?.faculty_id]);

  const s1Subjects = enrollments.filter(e => e.subjects?.semester === 1);
  const s2Subjects = enrollments.filter(e => e.subjects?.semester === 2);

  const calcSemesterStats = (subs: EnrollmentRow[]) => {
    const graded = subs.filter(e => e.subject_average !== null);
    const totalCredits = subs.reduce((acc, e) => acc + (e.subjects?.credits || 0), 0);
    const earnedCredits = subs.reduce((acc, e) => acc + e.credits_earned, 0);
    const avg = graded.length > 0
      ? graded.reduce((acc, e) => acc + (e.subject_average || 0) * (e.subjects?.credits || 1), 0) /
        graded.reduce((acc, e) => acc + (e.subjects?.credits || 1), 0)
      : null;
    return { totalCredits, earnedCredits, avg };
  };

  const s1Stats = calcSemesterStats(s1Subjects);
  const s2Stats = calcSemesterStats(s2Subjects);
  const totalEarned = s1Stats.earnedCredits + s2Stats.earnedCredits;
  const totalCredits = s1Stats.totalCredits + s2Stats.totalCredits;

  const handlePrint = () => window.print();

  const renderSemesterTable = (subs: EnrollmentRow[], semesterNum: number, stats: ReturnType<typeof calcSemesterStats>) => (
    <div className="mb-8">
      <h3 className="text-md font-bold text-slate-800 dark:text-white mb-3">Semestre {semesterNum} / الفصل {semesterNum === 1 ? 'الأول' : 'الثاني'}</h3>
      <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr className="text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
            <th className="p-3 border-r border-slate-200 dark:border-slate-700">المادة (FR)</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-right">المادة (AR)</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700">الوحدة</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">الوحدات</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">أعمال</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">امتحان ١</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">امتحان ٢</th>
            <th className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">المعدل</th>
            <th className="p-3 text-center">الوحدات المكتسبة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {subs.map(en => (
            <tr key={en.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 font-medium">{en.subjects?.name_fr}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-right">{en.subjects?.name_ar}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-xs">{en.subjects?.unit_name_fr}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center font-semibold">{en.subjects?.credits}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">{en.classwork !== null ? en.classwork.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">{en.exam_session_1 !== null ? en.exam_session_1.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-slate-200 dark:border-slate-700 text-center">{en.exam_session_2 !== null ? en.exam_session_2.toFixed(2) : '—'}</td>
              <td className={`p-3 border-r border-slate-200 dark:border-slate-700 text-center font-bold ${en.subject_average !== null && en.subject_average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {en.subject_average !== null ? en.subject_average.toFixed(2) : '—'}
              </td>
              <td className="p-3 text-center font-bold">{en.credits_earned}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <tr className="font-bold text-slate-800 dark:text-white">
            <td colSpan={3} className="p-3 text-right">المجموع / Total</td>
            <td className="p-3 text-center">{stats.totalCredits}</td>
            <td colSpan={4} className="p-3 text-center">
              المعدل الفصلي: <span className={stats.avg !== null && stats.avg >= 10 ? 'text-emerald-600' : 'text-rose-600'}>
                {stats.avg !== null ? stats.avg.toFixed(2) : '—'}
              </span>
            </td>
            <td className="p-3 text-center">{stats.earnedCredits}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div />
        <button onClick={handlePrint} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-2">
          <Printer className="w-4 h-4" /><span>Imprimer / طباعة PDF</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-8 print-only-hidden-border">
        <div className="print-header mb-8 text-center border-b-2 border-slate-300 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <p className="text-sm font-bold text-slate-500">الجمهورية التشادية</p>
              <p className="text-xs text-slate-400">République du Tchad</p>
              <p className="text-sm font-bold text-slate-500 mt-1">جامعة الملك فيصل بتشاد</p>
              <p className="text-xs text-slate-400">{facultyName.name_fr}</p>
              <p className="text-xs text-slate-400">{facultyName.name_ar}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">السنة الجامعية: 2025-2026</p>
              <p className="text-xs text-slate-400">Année Universitaire: 2025-2026</p>
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-800">كشف الدرجات / Relevé de Notes</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-4 text-xs text-slate-600 max-w-lg mx-auto">
            <div className="flex justify-between"><span className="font-semibold">الاسم واللقب:</span><span>{profile?.name_ar}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Nom & Prénom:</span><span>{profile?.name_fr}</span></div>
            <div className="flex justify-between"><span className="font-semibold">الرقم الجامعي:</span><span>{profile?.university_id}</span></div>
            <div className="flex justify-between"><span className="font-semibold">القسم:</span><span>{profile?.section || '—'}</span></div>
            <div className="flex justify-between"><span className="font-semibold">المستوى:</span><span>{profile?.level || '—'}</span></div>
            {profile?.date_of_birth && (
              <div className="flex justify-between"><span className="font-semibold">تاريخ الميلاد:</span><span>{new Date(profile.date_of_birth).toLocaleDateString()}</span></div>
            )}
            {profile?.place_of_birth && (
              <div className="flex justify-between"><span className="font-semibold">مكان الميلاد:</span><span>{profile.place_of_birth}</span></div>
            )}
          </div>
        </div>

        {renderSemesterTable(s1Subjects, 1, s1Stats)}
        {renderSemesterTable(s2Subjects, 2, s2Stats)}

        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Total Crédits</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{totalCredits}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Crédits Obttenus / الوحدات المكتسبة</p>
              <p className="text-lg font-black text-emerald-600">{totalEarned}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">المعدل العام / Moyenne Générale</p>
              <p className="text-lg font-black">
                {(() => {
                  const all = [...s1Subjects, ...s2Subjects].filter(e => e.subject_average !== null);
                  if (all.length === 0) return <span className="text-slate-400">—</span>;
                  const avg = all.reduce((acc, e) => acc + (e.subject_average || 0) * (e.subjects?.credits || 1), 0) /
                    all.reduce((acc, e) => acc + (e.subjects?.credits || 1), 0);
                  return <span className={avg >= 10 ? 'text-emerald-600' : 'text-rose-600'}>{avg.toFixed(2)}</span>;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
