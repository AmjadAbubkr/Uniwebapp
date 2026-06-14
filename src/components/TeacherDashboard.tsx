import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  BookOpen, Megaphone, LogOut, KeyRound,
  ShieldAlert, Activity, Plus, Trash2
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'home' | 'subjects' | 'profile'>('home');
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
              <span className="text-xs text-indigo-400 font-semibold uppercase">Teacher Panel</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { key: 'home', icon: Megaphone, label: 'Annonces / الإعلانات' },
              { key: 'subjects', icon: BookOpen, label: 'Matières / المواد' },
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
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">P</div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.name_fr || 'Teacher'}</p>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Enseignant</span>
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
              {activeTab === 'subjects' && 'Matières & Notes / المواد والدرجات'}
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

          {activeTab === 'home' && <TeacherHome facultyId={profile?.faculty_id!} />}
          {activeTab === 'subjects' && <TeacherSubjects teacherId={profile?.id!} />}
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

const TeacherHome: React.FC<{ facultyId: string }> = ({ facultyId }) => {
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
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{a.title}</h4>
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

const TeacherSubjects: React.FC<{ teacherId: string }> = ({ teacherId }) => {
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
            <button
              key={s.id}
              onClick={() => handleSelectSubject(s.id)}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6 text-left hover:border-indigo-400 transition-all cursor-pointer"
            >
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{s.name_fr}</h4>
              <p className="text-xs text-slate-500 mt-1">{s.unit_name_fr} • {s.credits} crédits • S{s.semester}</p>
              <p className="text-xs text-slate-400 mt-1">{s.section} — {s.level}</p>
            </button>
          ))}
          {subjects.length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-8">Aucune matière assignée / لا توجد مواد معينة</p>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => setSelectedSubject(null)} className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer mb-2 font-semibold">&larr; Retour aux matières</button>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{currentSubject?.name_fr} — {currentSubject?.name_ar}</h3>
              <p className="text-xs text-slate-400">{currentSubject?.unit_name_fr} • {currentSubject?.credits} crédits • {currentSubject?.section} • {currentSubject?.level} • S{currentSubject?.semester}</p>
            </div>
            <button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1">
              <Plus className="w-4 h-4" /><span>Annonce / إعلان</span>
            </button>
          </div>

          {showAnnouncementForm && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6">
              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <input type="text" required placeholder="Titre / العنوان" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden" />
                <textarea required rows={3} placeholder="Contenu / المحتوى" value={annContent} onChange={e => setAnnContent(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-hidden resize-none" />
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition-all">Publier / نشر</button>
              </form>
            </div>
          )}

          {subjectAnnouncements.length > 0 && (
            <div className="space-y-3">
              {subjectAnnouncements.map(a => (
                <div key={a.id} className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300">{a.title}</h5>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-[10px] text-indigo-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-3xl p-6 overflow-x-auto">
            <h4 className="text-md font-bold text-slate-800 dark:text-white mb-4">Saisie des Notes / إدخال الدرجات ({enrollments.length} étudiants)</h4>
            {enrollments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucun étudiant inscrit / لا يوجد طلاب مسجلون</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">Nom</th>
                    <th className="pb-2 pr-4 text-center">أعمال<br/><span className="font-normal text-[10px]">Classwork</span></th>
                    <th className="pb-2 pr-4 text-center">امتحان ١<br/><span className="font-normal text-[10px]">Exam S1</span></th>
                    <th className="pb-2 pr-4 text-center">امتحان ٢<br/><span className="font-normal text-[10px]">Exam S2</span></th>
                    <th className="pb-2 pr-4 text-center">المعدل<br/><span className="font-normal text-[10px]">Avg</span></th>
                    <th className="pb-2 text-center">الوحدات<br/><span className="font-normal text-[10px]">Credits</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrollments.map(en => {
                    const isEditing = editCell?.enrollmentId === en.id;
                    return (
                      <tr key={en.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-2 pr-4 font-mono font-semibold">{en.profiles?.university_id}</td>
                        <td className="py-2 pr-4">
                          <div className="font-medium">{en.profiles?.name_fr}</div>
                          <div className="text-[10px] text-slate-400 text-right">{en.profiles?.name_ar}</div>
                        </td>
                        {['classwork', 'exam_session_1', 'exam_session_2'].map(field => {
                          const val = (en as any)[field] as number | null;
                          const isThisCell = isEditing && editCell.field === field;
                          return (
                            <td key={field} className="py-2 pr-4 text-center">
                              {isThisCell ? (
                                <input
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
                                  className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-indigo-400 rounded-lg text-center text-xs text-slate-800 dark:text-white focus:outline-hidden"
                                />
                              ) : (
                                <span
                                  onClick={() => handleStartEdit(en.id, field, val)}
                                  className={`inline-block min-w-[2rem] px-2 py-1 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${
                                    val !== null ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                >
                                  {val !== null ? val.toFixed(2) : '—'}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 pr-4 text-center">
                          <span className={`font-bold ${en.subject_average !== null && en.subject_average >= 10 ? 'text-emerald-600' : en.subject_average !== null ? 'text-rose-600' : 'text-slate-400'}`}>
                            {en.subject_average !== null ? en.subject_average.toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`font-bold ${en.credits_earned > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
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
