import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LangToggle } from './LangToggle';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import {
  Megaphone, GraduationCap, KeyRound, LogOut, ShieldAlert,
  Activity, Download
} from 'lucide-react';

interface EnrollmentRow {
  id: string;
  classwork: number | null;
  exam_session_1: number | null;
  exam_session_2: number | null;
  subject_average: number | null;
  credits_earned: number;
  academic_year?: string;
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
  const { t } = useLang();
  const [pageKey, setPageKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'grades' | 'profile'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Increment pageKey to trigger page transition animation on tab switch
  useEffect(() => {
    setPageKey(k => k + 1);
  }, [activeTab]);

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
    <div className="min-h-screen flex bg-white safe-top">
      <aside className="hidden lg:flex w-64 bg-[#092a1e] text-[#f3fcf6] flex flex-col justify-between shrink-0 shadow-xl border-r border-[#074d31]">
        <div>
          <div className="p-6 border-b border-[#074d31] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#067647] rounded-lg flex items-center justify-center font-bold text-white shadow-md">KF</div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-[#1b8354] font-semibold uppercase">Student Portal</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: Megaphone, label: t('Annonces', 'الإعلانات') },
              { key: 'grades', icon: GraduationCap, label: t('Notes', 'الدرجات') },
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
            <div className="w-8 h-8 rounded-full bg-[#067647]/20 text-[#1b8354] flex items-center justify-center font-bold">S</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Student'}</p>
              <span className="text-[10px] text-[#1b8354] uppercase font-semibold">Étudiant</span>
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
              {activeTab === 'home' && t('Annonces', 'الإعلانات')}
              {activeTab === 'grades' && t('Relevé de Notes', 'كشف الدرجات')}
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
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-md flex items-start space-x-2 text-rose-800 text-sm no-print">
              <ShieldAlert className="w-5 h-5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-[#f3fcf6] border-l-4 border-[#067647] rounded-r-md flex items-start space-x-2 text-[#074d31] text-sm no-print">
              <Activity className="w-5 h-5 shrink-0" /><span>{success}</span>
            </div>
          )}

          <div key={pageKey} className="animate-page-in">
          {activeTab === 'home' && <StudentHome facultyId={profile?.faculty_id!} />}
          {activeTab === 'grades' && <StudentGrades studentId={profile?.id!} profile={profile!} />}
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
                    <input type="password" required placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">{t('Confirmer le Mot de Passe', 'تأكيد كلمة المرور')}</label>
                    <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]" />
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
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50 flex justify-around items-center bg-white/95 backdrop-blur-md border border-[#f3fcf6] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-2xl h-16 max-w-[90vw] sm:max-w-sm px-3 overflow-hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)', width: 'stretch' }}
      >
        {[
          { key: 'home', icon: Megaphone, label: 'إعلانات' },
          { key: 'grades', icon: GraduationCap, label: 'الدرجات' },
          { key: 'profile', icon: KeyRound, label: 'الملف' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className="relative flex flex-col items-center justify-center w-full h-full rounded-lg transition-all cursor-pointer"
          >
            <Icon className={`w-5 h-5 transition-colors ${activeTab === key ? 'text-[#067647]' : 'text-[#666666]'}`} />
            <span className={`text-[9px] mt-0.5 leading-tight ${activeTab === key ? 'text-[#067647] font-semibold' : 'text-[#666666]'}`}>
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

const StudentHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
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
        <div className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-[#666666] mb-4" />
          <p className="text-[#666666]">{t('Aucune annonce', 'لا توجد إعلانات')}</p>
        </div>
      ) : (
        announcements.map(a => (
          <div key={a.id} className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#f3fcf6] rounded-lg flex items-center justify-center text-[#067647] shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-[#000000]">{a.title}</h4>
                  {a.subjects && <span className="text-[10px] bg-[#f3fcf6] text-[#067647] px-2 py-0.5 rounded-md font-semibold">{a.subjects.name_fr}</span>}
                </div>
                <p className="text-xs text-[#666666] mt-1 whitespace-pre-wrap">{a.content}</p>
                <p className="text-[10px] text-[#666666] mt-2">{new Date(a.created_at).toLocaleString()}</p>
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
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const availableYears = ['2024-2025', '2025-2026', '2026-2027'];

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

  const yearEnrollments = enrollments.filter(e => !e.academic_year || e.academic_year === selectedYear);
  const s1Subjects = yearEnrollments.filter(e => e.subjects?.semester === 1);
  const s2Subjects = yearEnrollments.filter(e => e.subjects?.semester === 2);

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

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = async (year: string) => {
    const element = document.getElementById(`grades-report-${year}`);
    if (!element) return;
    setPdfLoading(true);
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const imgWidth = pageWidth;
      const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`releve-notes-${year}-${profile?.university_id || 'etudiant'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const renderSemesterTable = (subs: EnrollmentRow[], semesterNum: number, stats: ReturnType<typeof calcSemesterStats>) => (
    <div className="mb-8">
      <h3 className="text-md font-bold text-[#000000] mb-3">Semestre {semesterNum} / الفصل {semesterNum === 1 ? 'الأول' : 'الثاني'}</h3>
      <table className="w-full text-left text-xs border-collapse border border-[#d2d6db]">
        <thead className="bg-[#f3fcf6]">
          <tr className="text-[#666666] font-bold border-b border-[#d2d6db]">
            <th className="p-3 border-r border-[#d2d6db]">المادة (FR)</th>
            <th className="p-3 border-r border-[#d2d6db] text-right">المادة (AR)</th>
            <th className="p-3 border-r border-[#d2d6db]">الوحدة</th>
            <th className="p-3 border-r border-[#d2d6db] text-center">الوحدات</th>
            <th className="p-3 border-r border-[#d2d6db] text-center">أعمال</th>
            <th className="p-3 border-r border-[#d2d6db] text-center">امتحان ١</th>
            <th className="p-3 border-r border-[#d2d6db] text-center">امتحان ٢</th>
            <th className="p-3 border-r border-[#d2d6db] text-center">المعدل</th>
            <th className="p-3 text-center">الوحدات المكتسبة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d2d6db]">
          {subs.map(en => (
            <tr key={en.id} className="text-[#000000] hover:bg-[#f3fcf6]">
              <td className="p-3 border-r border-[#d2d6db] font-medium">{en.subjects?.name_fr}</td>
              <td className="p-3 border-r border-[#d2d6db] text-right">{en.subjects?.name_ar}</td>
              <td className="p-3 border-r border-[#d2d6db] text-xs">{en.subjects?.unit_name_fr}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center font-semibold">{en.subjects?.credits}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center">{en.classwork !== null ? en.classwork.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center">{en.exam_session_1 !== null ? en.exam_session_1.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center">{en.exam_session_2 !== null ? en.exam_session_2.toFixed(2) : '—'}</td>
              <td className={`p-3 border-r border-[#d2d6db] text-center font-bold ${en.subject_average !== null && en.subject_average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {en.subject_average !== null ? en.subject_average.toFixed(2) : '—'}
              </td>
              <td className="p-3 text-center font-bold">{en.credits_earned}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-[#f3fcf6] border-t border-[#d2d6db]">
          <tr className="font-bold text-[#000000]">
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
        <div className="flex items-center space-x-2">
          <label className="text-sm font-semibold text-[#666666]">Année Universitaire / السنة الجامعية</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="px-3 py-2 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647]">
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={() => handleDownloadPdf(selectedYear)} disabled={pdfLoading} className="px-4 py-2.5 bg-[#067647] hover:bg-[#074d31] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-all flex items-center space-x-2 disabled:opacity-50">
          <Download className="w-4 h-4" />
          <span>{pdfLoading ? 'Génération...' : `Télécharger PDF (${selectedYear})`}</span>
        </button>
      </div>

      <div id={`grades-report-${selectedYear}`} className="bg-white border border-[#f3fcf6] shadow-[rgba(16,24,40,0.08)_0px_12px_16px_-4px,rgba(16,24,40,0.03)_0px_4px_6px_-2px] rounded-lg p-8">
        <div className="print-header mb-8 text-center border-b-2 border-[#f3fcf6] pb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <p className="text-sm font-bold text-[#000000]">السنة الجامعية: {selectedYear}</p>
              <p className="text-xs text-[#666666]">Année Universitaire: {selectedYear}</p>
            </div>
            <div className="text-right font-capitalized">
              <p className="text-sm font-bold text-[#666666]">جمهورية تشاد</p>
              <p className="text-xs text-[#666666]">République du Tchad</p>
              <p className="text-sm font-bold text-[#666666]">وزارة التربية والتعليم والبحت والتكوين العلمي</p>
              <p className="text-xs text-[#666666]">Ministere de l'Enseignement Supérieur de la recherche et de la formation supérieure</p>
              <p className="text-sm font-bold text-[#666666] mt-1">جامعة الملك فيصل بتشاد</p>
              <p className="text-sm font-bold text-[#666666] mt-1">universte du roi faycal du tchad</p>
              <p className="text-xs text-[#666666]">{facultyName.name_fr}</p>
              <p className="text-xs text-[#666666]">{facultyName.name_ar}</p>
            </div>
          </div>
          <h2 className="text-xl font-black text-[#000000]">كشف الدرجات / Relevé de Notes</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-4 text-xs text-[#000000] max-w-lg mx-auto">
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

        <div className="mt-8 p-4 bg-[#f3fcf6] border border-[#f3fcf6] rounded-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-[#666666] font-bold uppercase">Total Crédits</p>
              <p className="text-lg font-black text-[#000000]">{totalCredits}</p>
            </div>
            <div>
              <p className="text-xs text-[#666666] font-bold uppercase">Crédits Obttenus / الوحدات المكتسبة</p>
              <p className="text-lg font-black text-emerald-600">{totalEarned}</p>
            </div>
            <div>
              <p className="text-xs text-[#666666] font-bold uppercase">المعدل العام / Moyenne Générale</p>
              <p className="text-lg font-black">
                {(() => {
                  const all = [...s1Subjects, ...s2Subjects].filter(e => e.subject_average !== null);
                  if (all.length === 0) return <span className="text-[#666666]">—</span>;
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
