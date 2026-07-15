import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LangToggle } from './LangToggle';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';
import {
  BookOpen, Megaphone, LogOut, KeyRound,
  Plus, Trash2
} from 'lucide-react';
import { Button, Input, Alert } from '../ui';

interface SubjectInfo {
  id: string;
  name_ar: string;
  name_fr: string;
  unit_name_fr: string;
  credits: number;
  section: string;
  level: string;
  semester: number;
}

interface EnrollmentRow {
  id: string;
  student_id: string;
  classwork: number | null;
  exam_session_1: number | null;
  exam_session_2: number | null;
  subject_average: number | null;
  credits_earned: number;
  profiles: { name_fr: string; name_ar: string; university_id: string } | null;
}

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const TeacherDashboard: React.FC = () => {
  const { logout, profile } = useAuth();
  const { t, isRTL } = useLang();
  const [pageKey, setPageKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'subjects' | 'profile'>('home');
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
          <div className={`p-6 border-b border-[#0077a8] flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-[#00b4d8] rounded-lg flex items-center justify-center shadow-md p-1.5"><img src={logo} alt="KF" className="w-full h-full object-contain img-outline" /></div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Univ Roi Fayçal</h2>
              <span className="text-xs text-[#0099c2] font-semibold uppercase">Teacher Panel</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: Megaphone, label: t('Annonces', 'الإعلانات') },
              { key: 'subjects', icon: BookOpen, label: t('Matières', 'المواد') },
              { key: 'profile', icon: KeyRound, label: t('Profil', 'الملف الشخصي') },
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant="ghost"
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
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
          <div className={`px-4 py-3 bg-[#0077a8]/50 rounded-lg flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-full bg-[#00b4d8]/20 text-[#0099c2] flex items-center justify-center font-bold">P</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Teacher'}</p>
              <span className="text-[10px] text-[#0099c2] uppercase font-semibold">Enseignant</span>
            </div>
          </div>
           <Button onClick={logout} variant="danger" className={`w-full flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-4 py-3 text-sm font-semibold cursor-pointer transition-colors active:scale-[0.96]`}>
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
              {activeTab === 'subjects' && t('Matières & Notes', 'المواد والدرجات')}
              {activeTab === 'profile' && t('Paramètres du Profil', 'إعدادات الحساب')}
            </h1>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="flex items-center space-x-2 px-3 py-2 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-4 lg:space-y-8">
          {error && <Alert variant="error" message={error} />}
          {success && <Alert variant="success" message={success} />}

          <div key={pageKey} className="animate-page-in">
          {activeTab === 'home' && <TeacherHome facultyId={profile?.faculty_id!} />}
          {activeTab === 'subjects' && <TeacherSubjects teacherId={profile?.id!} />}
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
                   <Button type="submit" variant="primary" disabled={loading} className="w-full py-3 font-semibold text-sm rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96]">
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
        className={`lg:hidden fixed left-4 right-4 z-50 flex justify-around items-center backdrop-blur-2xl bg-white/50 border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] h-16 overflow-hidden ${isRTL ? 'rtl-flex-row' : ''}`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        {[
          { key: 'home', icon: Megaphone, label: 'إعلانات' },
          { key: 'subjects', icon: BookOpen, label: 'المواد' },
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

const TeacherHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
  const { t } = useLang();
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('announcements').select('*').eq('faculty_id', facultyId).is('subject_id', null).order('created_at', { ascending: false });
      setAnnouncements(data || []);
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
                <h4 className="text-sm font-bold text-[#000000]">{a.title}</h4>
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

const TeacherSubjects: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { t } = useLang();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [editCell, setEditCell] = useState<{ enrollmentId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [subjectAnnouncements, setSubjectAnnouncements] = useState<AnnouncementRow[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('subjects').select('*').eq('teacher_id', teacherId).order('name_fr');
      setSubjects(data || []);
    };
    load();
  }, [teacherId]);

  const loadEnrollments = useCallback(async (subjectId: string) => {
    const { data } = await supabase
      .from('enrollments')
      .select('*, profiles(name_fr, name_ar, university_id)')
      .eq('subject_id', subjectId)
      .order('profiles(name_fr)');
    setEnrollments((data as EnrollmentRow[]) || []);

    const { data: anns } = await supabase.from('announcements').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
    setSubjectAnnouncements(anns || []);
  }, []);

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setEditCell(null);
    loadEnrollments(subjectId);
  };

  const handleStartEdit = (enrollmentId: string, field: string, currentValue: number | null) => {
    setEditCell({ enrollmentId, field });
    setEditValue(currentValue !== null ? String(currentValue) : '');
  };

  const handleSaveEdit = async () => {
    if (!editCell) return;
    setSaving(true);
    const val = editValue.trim() === '' ? null : parseFloat(editValue);
    if (val !== null && (isNaN(val) || val < 0 || val > 20)) {
      setSaving(false);
      return;
    }
    const update: any = {};
    update[editCell.field] = val;
    await supabase.from('enrollments').update(update).eq('id', editCell.enrollmentId);
    setEditCell(null);
    if (selectedSubject) loadEnrollments(selectedSubject);
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditCell(null);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim() || !selectedSubject) return;
    await supabase.from('announcements').insert({
      author_id: teacherId,
      subject_id: selectedSubject,
      faculty_id: subjects.find(s => s.id === selectedSubject)?.section ? undefined : undefined,
      title: annTitle.trim(),
      content: annContent.trim(),
    });
    setAnnTitle(''); setAnnContent('');
    setShowAnnouncementForm(false);
    loadEnrollments(selectedSubject);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    if (selectedSubject) loadEnrollments(selectedSubject);
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      {!selectedSubject ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(s => (
            <Button
              key={s.id}
              variant="ghost"
              onClick={() => handleSelectSubject(s.id)}
              className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6 text-left hover:border-[#00b4d8] transition-all cursor-pointer"
            >
              <h4 className="text-sm font-bold text-[#000000]">{s.name_fr}</h4>
              <p className="text-xs text-[#666666] mt-1">{s.unit_name_fr} • {s.credits} crédits • S{s.semester}</p>
              <p className="text-xs text-[#666666] mt-1">{s.section} — {s.level}</p>
            </Button>
          ))}
          {subjects.length === 0 && <p className="text-sm text-[#666666] col-span-full text-center py-8">{t('Aucune matière assignée', 'لا توجد مواد معينة')}</p>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Button onClick={() => setSelectedSubject(null)} variant="ghost" className="text-xs text-[#00b4d8] hover:text-[#0077a8] cursor-pointer mb-2 font-semibold">&larr; Retour aux matières</Button>
              <h3 className="text-lg font-bold text-[#000000]">{currentSubject?.name_fr} — {currentSubject?.name_ar}</h3>
              <p className="text-xs text-[#666666]">{currentSubject?.unit_name_fr} • {currentSubject?.credits} crédits • {currentSubject?.section} • {currentSubject?.level} • S{currentSubject?.semester}</p>
            </div>
             <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} variant="primary" className="px-4 py-2 font-semibold text-xs rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96] flex items-center space-x-1">
              <Plus className="w-4 h-4" /><span>{t('Annonce', 'إعلان')}</span>
            </Button>
          </div>

          {showAnnouncementForm && (
            <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6">
              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <Input type="text" required placeholder={t('Titre', 'العنوان')} value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8]" />
                <textarea required rows={3} placeholder={t('Contenu', 'المحتوى')} value={annContent} onChange={e => setAnnContent(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#d2d6db] rounded-md text-sm text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8] resize-none" />
                 <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm rounded-md cursor-pointer shadow-md transition-transform active:scale-[0.96]">{t('Publier', 'نشر')}</Button>
              </form>
            </div>
          )}

          {subjectAnnouncements.length > 0 && (
            <div className="space-y-3">
              {subjectAnnouncements.map(a => (
                <div key={a.id} className="bg-[#e8f7fc] border border-[#e8f7fc] rounded-md p-4 flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-[#0077a8]">{a.title}</h5>
                    <p className="text-xs text-[#00b4d8] mt-1 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-[10px] text-[#666666] mt-1">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => handleDeleteAnnouncement(a.id)} variant="danger" className="text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-[#e8f7fc] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.5)_inset] rounded-[20px] p-6 overflow-x-auto">
            <h4 className="text-md font-bold text-[#000000] mb-4">{t('Saisie des Notes', 'إدخال الدرجات')} ({enrollments.length} {t('étudiants', 'طالب')})</h4>
            {enrollments.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-6">{t('Aucun étudiant inscrit', 'لا يوجد طلاب مسجلون')}</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e8f7fc] text-[#666666] font-bold">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">Nom</th>
                    <th className="pb-2 pr-4 text-center">أعمال<br/><span className="font-normal text-[10px]">Classwork</span></th>
                    <th className="pb-2 pr-4 text-center">امتحان ١<br/><span className="font-normal text-[10px]">Exam S1</span></th>
                    <th className="pb-2 pr-4 text-center">امتحان ٢<br/><span className="font-normal text-[10px]">Exam S2</span></th>
                    <th className="pb-2 pr-4 text-center">المعدل<br/><span className="font-normal text-[10px]">Avg</span></th>
                    <th className="pb-2 text-center">الوحدات<br/><span className="font-normal text-[10px]">Credits</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8f7fc]">
                  {enrollments.map(en => {
                    const isEditing = editCell?.enrollmentId === en.id;
                    return (
                      <tr key={en.id} className="text-[#000000]">
                        <td className="py-2 pr-4 font-mono font-semibold">{en.profiles?.university_id}</td>
                        <td className="py-2 pr-4">
                          <div className="font-medium">{en.profiles?.name_fr}</div>
                          <div className="text-[10px] text-[#666666] text-right">{en.profiles?.name_ar}</div>
                        </td>
                        {['classwork', 'exam_session_1', 'exam_session_2'].map(field => {
                          const val = (en as any)[field] as number | null;
                          const isThisCell = isEditing && editCell.field === field;
                          return (
                            <td key={field} className="py-2 pr-4 text-center">
                              {isThisCell ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="20"
                                  autoFocus
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleSaveEdit}
                                  disabled={saving}
                                  className="w-16 px-2 py-1 bg-white border border-[#00b4d8] rounded-md text-center text-xs text-[#000000] focus:outline-hidden"
                                />
                              ) : (
                                <span
                                  onClick={() => handleStartEdit(en.id, field, val)}
                                  className={`inline-block min-w-[2rem] px-2 py-1 rounded-md cursor-pointer hover:bg-[#e8f7fc] transition-colors ${
                                    val !== null ? 'font-bold text-[#000000]' : 'text-[#666666]'
                                  }`}
                                >
                                  {val !== null ? val.toFixed(2) : '—'}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 pr-4 text-center">
                          <span className={`font-bold nums-tabular ${en.subject_average !== null && en.subject_average >= 10 ? 'text-emerald-600' : en.subject_average !== null ? 'text-rose-600' : 'text-[#666666]'}`}>
                            {en.subject_average !== null ? en.subject_average.toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`font-bold nums-tabular ${en.credits_earned > 0 ? 'text-emerald-600' : 'text-[#666666]'}`}>
                            {en.credits_earned}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};
