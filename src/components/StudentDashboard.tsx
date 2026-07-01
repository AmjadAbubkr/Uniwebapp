import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LangToggle } from './LangToggle';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';
import {
  Megaphone, GraduationCap, KeyRound, LogOut,
  Download, ArrowLeft, FileText
} from 'lucide-react';
import { Button, Input, Alert } from '../ui';

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
    level: string;
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
      <aside className="hidden lg:flex w-64 bg-[#0a0e1a] text-[#e8f7fc] flex flex-col justify-between shrink-0 shadow-xl border-r border-[#0077a8]">
        <div>
          <div className="p-6 border-b border-[#0077a8] flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00b4d8] rounded-lg flex items-center justify-center shadow-md p-1.5"><img src={logo} alt="KF" className="w-full h-full object-contain img-outline" /></div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-[#0099c2] font-semibold uppercase">Student Portal</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: Megaphone, label: t('Annonces', 'الإعلانات') },
              { key: 'grades', icon: GraduationCap, label: t('Notes', 'الدرجات') },
              { key: 'profile', icon: KeyRound, label: t('Profil', 'الملف الشخصي') },
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant="ghost"
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? 'bg-[#00b4d8] text-white shadow-lg'
                    : 'text-[#0099c2] hover:bg-[#0077a8] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#0077a8] space-y-3">
          <div className="px-4 py-3 bg-[#0077a8]/50 rounded-lg flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#00b4d8]/20 text-[#0099c2] flex items-center justify-center font-bold">S</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Student'}</p>
              <span className="text-[10px] text-[#0099c2] uppercase font-semibold">Étudiant</span>
            </div>
          </div>
          <Button variant="danger" onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors active:scale-[0.96]">
            <LogOut className="w-5 h-5" />
            <span>{t('Déconnexion', 'خروج')}</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e8f7fc]/60 flex items-center justify-between px-4 lg:px-8 py-3 lg:py-0 lg:h-20">
          <div>
            <h1 className="text-xl font-extrabold text-[#000000] text-balance">
              {activeTab === 'home' && t('Annonces', 'الإعلانات')}
              {activeTab === 'grades' && t('Relevé de Notes', 'كشف الدرجات')}
              {activeTab === 'profile' && t('Paramètres du Profil', 'إعدادات الحساب')}
            </h1>
          </div>
          <Button
            variant="danger"
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-4 lg:space-y-8">
          {error && <Alert variant="error" message={error} className="no-print" />}
          {success && <Alert variant="success" message={success} className="no-print" />}

          <div key={pageKey} className="animate-page-in">
          {activeTab === 'home' && <StudentHome facultyId={profile?.faculty_id!} />}
          {activeTab === 'grades' && <StudentGrades studentId={profile?.id!} profile={profile!} />}
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
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">{t('Nouveau Mot de Passe', 'كلمة المرور الجديدة')}</label>
                    <Input type="password" required placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">{t('Confirmer le Mot de Passe', 'تأكيد كلمة المرور')}</label>
                    <Input type="password" required placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-[#000000] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]" />
                  </div>
                  <Button variant="primary" type="submit" disabled={loading} className="w-full py-3 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96]">
                    {loading ? t('Mise à jour...', 'تحديث...') : t('Mettre à jour', 'تحديث كلمة المرور')}
                  </Button>
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
          { key: 'home', icon: Megaphone, label: 'إعلانات' },
          { key: 'grades', icon: GraduationCap, label: 'الدرجات' },
          { key: 'profile', icon: KeyRound, label: 'الملف' },
        ].map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant="ghost"
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
          </Button>
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
        <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-[#666666] mb-4" />
          <p className="text-[#666666]">{t('Aucune annonce', 'لا توجد إعلانات')}</p>
        </div>
      ) : (
        announcements.map(a => (
          <div key={a.id} className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#e8f7fc] rounded-lg flex items-center justify-center text-[#00b4d8] shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-[#000000]">{a.title}</h4>
                  {a.subjects && <span className="text-[10px] bg-[#e8f7fc] text-[#00b4d8] px-2 py-0.5 rounded-md font-semibold">{a.subjects.name_fr}</span>}
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

const LEVELS_ORDER = ['1ère Année', '2ème Année', '3ème Année', '4ème Année'];

const StudentGrades: React.FC<{ studentId: string; profile: any }> = ({ studentId, profile }) => {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [facultyName, setFacultyName] = useState({ name_fr: '', name_ar: '' });
  
  const [gradesLoading, setGradesLoading] = useState(true);
  
  const [activeLevelForDetail, setActiveLevelForDetail] = useState<string | null>(null);
  
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleDownloadPdf = async (level: string) => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || SUPABASE_ANON_KEY;
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-report-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ studentId, level }),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody.error) detail = errBody.error;
        } catch { /* not JSON */ }
        throw new Error(detail);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `releve-notes-${level}-${profile?.university_id || "etudiant"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setPdfError(`PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setGradesLoading(true);
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*, subjects(name_ar, name_fr, unit_name_ar, unit_name_fr, credits, semester, level)')
          .eq('student_id', studentId);

        if (error) {
          console.error('Error fetching enrollments:', error);
          setGradesError(error.message);
        } else {
          setGradesError(null);
        }

        const normalized = ((data as EnrollmentRow[]) || []);
        normalized.sort((a, b) => (a.subjects?.semester || 0) - (b.subjects?.semester || 0));

        setEnrollments(normalized);

        if (profile?.faculty_id) {
          const { data: fac } = await supabase.from('faculties').select('name_fr, name_ar').eq('id', profile.faculty_id).single();
          if (fac) setFacultyName(fac as any);
        }
      } catch (err) {
        console.error('Error loading grades:', err);
        setGradesError(err instanceof Error ? err.message : String(err));
      } finally {
        setGradesLoading(false);
      }
    };
    load();
  }, [studentId, profile?.faculty_id]);

  const levels = Array.from(new Set(enrollments.map(e => e.subjects?.level).filter(Boolean) as string[]));
  
  const sortedLevels = [...levels].sort((a, b) => {
    const ai = LEVELS_ORDER.indexOf(a);
    const bi = LEVELS_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  
  const currentLevel = profile?.level || sortedLevels[sortedLevels.length - 1];
  
  const passedLevels = sortedLevels.filter(l => l !== currentLevel);

  const getLevelStats = (level: string) => {
    const levelEnrollments = enrollments.filter(e => e.subjects?.level === level);
    const s1Subs = levelEnrollments.filter(e => e.subjects?.semester === 1);
    const s2Subs = levelEnrollments.filter(e => e.subjects?.semester === 2);

    const calcStats = (subs: EnrollmentRow[]) => {
      const graded = subs.filter(e => e.subject_average !== null);
      const totalCredits = subs.reduce((acc, e) => acc + (e.subjects?.credits || 0), 0);
      const earnedCredits = subs.reduce((acc, e) => acc + e.credits_earned, 0);
      const sumWeighted = graded.reduce((acc, e) => acc + (e.subject_average || 0) * (e.subjects?.credits || 1), 0);
      const sumCreditsGraded = graded.reduce((acc, e) => acc + (e.subjects?.credits || 1), 0);
      return { totalCredits, earnedCredits, sumWeighted, sumCreditsGraded };
    };

    const s1 = calcStats(s1Subs);
    const s2 = calcStats(s2Subs);

    const totalCredits = s1.totalCredits + s2.totalCredits;
    const earnedCredits = s1.earnedCredits + s2.earnedCredits;
    const totalWeighted = s1.sumWeighted + s2.sumWeighted;
    const totalCreditsGraded = s1.sumCreditsGraded + s2.sumCreditsGraded;

    const avg = totalCreditsGraded > 0 ? totalWeighted / totalCreditsGraded : null;
    const subjectsCount = levelEnrollments.length;

    return { totalCredits, earnedCredits, avg, subjectsCount };
  };



  if (gradesLoading) {
    return (
      <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-12 text-center">
        <div className="w-8 h-8 border-4 border-[#e8f7fc] border-t-[#00b4d8] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#666666] text-sm">Chargement... / جاري التحميل...</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-12 text-center">
        <GraduationCap className="w-12 h-12 mx-auto text-[#666666] mb-4" />
        <p className="text-[#666666]">Aucun relevé de notes disponible / لا يوجد كشف درجات.</p>
      </div>
    );
  }

  if (activeLevelForDetail !== null) {
    return (
      <div className="space-y-6">
        {gradesError && <Alert variant="error" message={gradesError} className="no-print" />}
        {pdfError && <Alert variant="error" message={pdfError} className="no-print" />}
        <div className="flex items-center justify-between no-print">
          <Button
            variant="ghost"
            onClick={() => setActiveLevelForDetail(null)}
            className="px-4 py-2 bg-[#e8f7fc] hover:bg-[#00b4d8]/20 text-[#0077a8] font-bold text-sm rounded-md transition-colors active:scale-[0.96] flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour / رجوع</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => handleDownloadPdf(activeLevelForDetail)}
            disabled={pdfLoading}
            className="px-4 py-2.5 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96] flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{pdfLoading ? 'Génération...' : `Télécharger PDF (${activeLevelForDetail})`}</span>
          </Button>
        </div>

        <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-4 sm:p-8 overflow-hidden">
          <GradesReportContent
            level={activeLevelForDetail}
            enrollments={enrollments}
            facultyName={facultyName}
            profile={profile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gradesError && <Alert variant="error" message={gradesError} className="no-print" />}
      {pdfError && <Alert variant="error" message={pdfError} className="no-print" />}
      {currentLevel && (() => {
        const stats = getLevelStats(currentLevel);
        return stats.subjectsCount > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#666666] uppercase tracking-wider">
              Niveau Actuel / المستوى الحالي
            </h3>
            <div className="bg-gradient-to-br from-[#e8f7fc]/40 to-white border-2 border-[#00b4d8]/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[20px] p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00b4d8]/10 rounded-xl flex items-center justify-center text-[#00b4d8] shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#000000]">{currentLevel}</h4>
                  <p className="text-xs text-[#666666]">
                    Niveau actuel / المستوى الحالي
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#666666]">
                    <span>{stats.subjectsCount} Matières / مواد</span>
                    <span>•</span>
                    <span className="nums-tabular">{stats.earnedCredits} / {stats.totalCredits} Credits / وحدات</span>
                    {stats.avg !== null && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-[#0077a8] nums-tabular">Moyenne: {stats.avg.toFixed(2)} / معدل</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => setActiveLevelForDetail(currentLevel)}
                  className="px-4 py-2.5 bg-[#e8f7fc] hover:bg-[#00b4d8]/20 text-[#0077a8] font-bold text-sm rounded-md transition-colors active:scale-[0.96] cursor-pointer"
                >
                  Consulter / عرض
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDownloadPdf(currentLevel)}
                  disabled={pdfLoading}
                  className="px-4 py-2.5 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-sm rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96] flex items-center space-x-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{pdfLoading ? '...' : 'PDF'}</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {passedLevels.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-[#666666] uppercase tracking-wider">
            Niveaux Précédents / المستويات السابقة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {passedLevels.map(level => {
              const stats = getLevelStats(level);
              return (
                <div key={level} className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[20px] p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#e8f7fc] rounded-lg flex items-center justify-center text-[#666666] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#000000]">{level}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[#666666]">
                        <span>{stats.subjectsCount} Matières / مواد</span>
                        <span>•</span>
                        <span className="nums-tabular">{stats.earnedCredits} / {stats.totalCredits} Credits / وحدات</span>
                        {stats.avg !== null && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-emerald-600 nums-tabular">Moyenne: {stats.avg.toFixed(2)} / معدل</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 pt-2 border-t border-[#e8f7fc]">
                    <Button
                      variant="secondary"
                      onClick={() => setActiveLevelForDetail(level)}
                      className="flex-1 px-3 py-2 bg-[#e8f7fc] hover:bg-[#00b4d8]/20 text-[#0077a8] font-bold text-xs rounded-md transition-colors active:scale-[0.96] cursor-pointer text-center"
                    >
                      Consulter / عرض
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleDownloadPdf(level)}
                      disabled={pdfLoading}
                      className="flex-1 px-3 py-2 bg-[#00b4d8] hover:bg-[#0077a8] text-white font-semibold text-xs rounded-md cursor-pointer transition-transform active:scale-[0.96] flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{pdfLoading ? '...' : 'PDF'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Component to render the detailed transcripts / grade sheets
const GradesReportContent: React.FC<{
  level: string;
  enrollments: EnrollmentRow[];
  facultyName: { name_fr: string; name_ar: string };
  profile: any;
}> = ({ level, enrollments, facultyName, profile }) => {
  const levelEnrollments = enrollments.filter(e => e.subjects?.level === level);
  const s1Subjects = levelEnrollments.filter(e => e.subjects?.semester === 1);
  const s2Subjects = levelEnrollments.filter(e => e.subjects?.semester === 2);

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

  const renderSemesterTable = (subs: EnrollmentRow[], semesterNum: number, stats: ReturnType<typeof calcSemesterStats>) => (
    <div className="mb-8">
      <h3 className="text-md font-bold text-[#000000] mb-3">Semestre {semesterNum} / الفصل {semesterNum === 1 ? 'الأول' : 'الثاني'}</h3>
      <div className="w-full overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[640px] text-left text-[10px] sm:text-xs border-collapse border border-[#d2d6db]">
        <thead className="bg-[#e8f7fc]">
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
            <tr key={en.id} className="text-[#000000] hover:bg-[#e8f7fc]">
              <td className="p-3 border-r border-[#d2d6db] font-medium">{en.subjects?.name_fr}</td>
              <td className="p-3 border-r border-[#d2d6db] text-right">{en.subjects?.name_ar}</td>
              <td className="p-3 border-r border-[#d2d6db] text-xs">{en.subjects?.unit_name_fr}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center font-semibold nums-tabular">{en.subjects?.credits}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center nums-tabular">{en.classwork !== null ? en.classwork.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center nums-tabular">{en.exam_session_1 !== null ? en.exam_session_1.toFixed(2) : '—'}</td>
              <td className="p-3 border-r border-[#d2d6db] text-center nums-tabular">{en.exam_session_2 !== null ? en.exam_session_2.toFixed(2) : '—'}</td>
              <td className={`p-3 border-r border-[#d2d6db] text-center font-bold nums-tabular ${en.subject_average !== null && en.subject_average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {en.subject_average !== null ? en.subject_average.toFixed(2) : '—'}
              </td>
              <td className="p-3 text-center font-bold nums-tabular">{en.credits_earned}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-[#e8f7fc] border-t border-[#d2d6db]">
          <tr className="font-bold text-[#000000]">
            <td colSpan={3} className="p-3 text-right">المجموع / Total</td>
            <td className="p-3 text-center nums-tabular">{stats.totalCredits}</td>
            <td colSpan={4} className="p-3 text-center">
              المعدل الفصلي: <span className={`nums-tabular ${stats.avg !== null && stats.avg >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats.avg !== null ? stats.avg.toFixed(2) : '—'}
              </span>
            </td>
            <td className="p-3 text-center nums-tabular">{stats.earnedCredits}</td>
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  );

  return (
    <div className="text-[10px] [&_*]:!text-[10px] [&_p]:!text-[10px] [&_span]:!text-[10px] [&_td]:!text-[10px] [&_th]:!text-[10px] [&_h2]:!text-[10px] [&_h3]:!text-[10px]">
      <div className="print-header mb-8 text-center border-b-2 border-[#e8f7fc] pb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <p className="text-sm font-bold text-[#000000]">المستوى: {level}</p>
            <p className="text-xs text-[#666666]">Niveau: {level}</p>
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

      <div className="mt-8 p-4 bg-[#e8f7fc] border border-[#e8f7fc] rounded-md">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#666666] font-bold uppercase">Total Crédits</p>
            <p className="text-lg font-black text-[#000000] nums-tabular">{totalCredits}</p>
          </div>
          <div>
            <p className="text-xs text-[#666666] font-bold uppercase">Crédits Obtenus / الوحدات المكتسبة</p>
            <p className="text-lg font-black text-emerald-600 nums-tabular">{totalEarned}</p>
          </div>
          <div>
            <p className="text-xs text-[#666666] font-bold uppercase">المعدل العام / Moyenne Générale</p>
            <p className="text-lg font-black">
              {(() => {
                const all = [...s1Subjects, ...s2Subjects].filter(e => e.subject_average !== null);
                if (all.length === 0) return <span className="text-[#666666]">—</span>;
                const avg = all.reduce((acc, e) => acc + (e.subject_average || 0) * (e.subjects?.credits || 1), 0) /
                  all.reduce((acc, e) => acc + (e.subjects?.credits || 1), 0);
                return <span className={`nums-tabular ${avg >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>{avg.toFixed(2)}</span>;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
