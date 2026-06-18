import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, User, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Input states
  const [uniId, setUniId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formattedId = uniId.trim().toLowerCase();

    if (!formattedId) {
      setError('Please enter your University ID.');
      setLoading(false);
      return;
    }

    if (isLogin) {
      try {
        const email = `${formattedId}@uni.edu`;
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message === 'Invalid login credentials' 
            ? 'Incorrect ID or Password. Please try again.' 
            : loginError.message);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during login.');
      } finally {
        setLoading(false);
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const { data: activeProfile } = await supabase
          .from('profiles')
          .select('university_id')
          .eq('university_id', formattedId)
          .maybeSingle();

        if (activeProfile) {
          setError('This account is already activated. Please log in.');
          setLoading(false);
          return;
        }

        const { data: pendingUser, error: pendingError } = await supabase
          .from('pending_users')
          .select('*')
          .eq('university_id', formattedId)
          .maybeSingle();

        if (pendingError) {
          console.error(pendingError);
        }

        if (!pendingUser) {
          setError('This ID is not registered in the database. Please contact your administrator.');
          setLoading(false);
          return;
        }

        const email = `${formattedId}@uni.edu`;
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          setError(signupError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          setSuccess('Account activated successfully! Logging you in...');
          const { error: autoLoginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (autoLoginError) {
            setIsLogin(true);
            setSuccess('Activation complete. Please log in.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during activation.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#092a1e] text-white overflow-hidden p-12 flex-col justify-between">
        
        {/* Abstract Background Artwork */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#067647] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#074d31] rounded-full blur-[120px]" />
          <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-[#1b8354] rounded-full blur-[100px]" />
        </div>

        {/* Top Section: Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 shadow-lg">
            <span className="font-bold text-2xl text-[#f3fcf6]">KF</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Université Roi Fayçal</h2>
            <p className="text-xs text-[#1b8354]">جامعة الملك فيصل بتشاد</p>
          </div>
        </div>

        {/* Middle Section: Welcome & Features */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <span className="bg-[#067647]/20 text-[#f3fcf6] border border-[#1b8354]/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Portail Académique / البوابة الأكاديمية
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Système de Gestion des Notes et Etudiants
          </h1>
          <p className="text-lg text-[#1b8354] font-medium leading-relaxed">
            نظام إدارة الطلاب والدرجات - كلية العلوم والتقنيات الهندسية
          </p>

          {/* Glassmorphism Widget */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 shadow-2xl mt-8">
            <h3 className="font-semibold text-white text-md mb-3 flex items-center">
              <span className="w-2.5 h-2.5 bg-[#1b8354] rounded-full mr-2.5 animate-pulse" />
              Accès Sécurisé par Rôle (RBAC)
            </h3>
            <p className="text-sm text-[#f3fcf6]/80 leading-relaxed">
              Un espace sécurisé pour les Administrateurs, Doyens, Enseignants et Étudiants afin de consulter, gérer et exporter les résultats académiques en temps réel.
            </p>
          </div>
        </div>

        {/* Bottom Section: Footer Info */}
        <div className="relative z-10 text-xs text-[#1b8354]/60 border-t border-white/10 pt-6 flex justify-between">
          <span>&copy; 2026 Université Roi Fayçal. Tous droits réservés.</span>
          <span>B.P. 582 N'Djamena, Tchad</span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.6)_inset] p-6 md:p-8">
          
          {/* Logo / Header for Mobile */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-[#067647] rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
              KF
            </div>
            <h2 className="text-xl font-bold text-[#000000]">Université Roi Fayçal</h2>
            <p className="text-sm text-[#666666]">جامعة الملك فيصل بتشاد</p>
          </div>

          {/* Tab Selection */}
          <div className="flex p-1 bg-[#f3fcf6]/80 backdrop-blur-sm rounded-[14px] mb-6 md:mb-8">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-white text-[#000000] shadow-sm'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccess(null);
              }}
            >
              <span className="block text-center">Connexion</span>
              <span className="block text-xs font-normal mt-0.5">تسجيل الدخول</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-white text-[#000000] shadow-sm'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccess(null);
              }}
            >
              <span className="block text-center">Activer Compte</span>
              <span className="block text-xs font-normal mt-0.5">تفعيل الحساب</span>
            </button>
          </div>

          {/* Title and Descriptions */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#000000]">
              {isLogin ? 'Bon retour !' : 'Première connexion ?'}
            </h3>
            <p className="text-sm text-[#666666] mt-1">
              {isLogin 
                ? 'Saisissez vos identifiants pour accéder à votre espace.' 
                : 'Configurez votre mot de passe pour activer votre espace personnel.'}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-md flex items-start space-x-2 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-[#f3fcf6] border-l-4 border-[#067647] rounded-r-md flex items-start space-x-2 text-[#074d31] text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                Identifiant / الرقم الجامعي (ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#666666]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: 9193, admin"
                  value={uniId}
                  onChange={(e) => setUniId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d2d6db] rounded-md text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                Mot de Passe / كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#666666]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d2d6db] rounded-md text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647] transition-all"
                />
              </div>
            </div>

            {/* Confirm Password for Activation */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                  Confirmer le Mot de Passe / تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#666666]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#d2d6db] rounded-md text-[#000000] focus:outline-hidden focus:ring-2 focus:ring-[#067647]/20 focus:border-[#067647] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#067647] hover:bg-[#074d31] text-white font-semibold rounded-md shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Traitement...' : isLogin ? 'Se Connecter' : 'Activer le Compte'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
