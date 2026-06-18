import { useAuth, AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { DeanDashboard } from './components/DeanDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import logo from './assets/logo.png';

const DashboardRouter: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#00b4d8] rounded-lg flex items-center justify-center shadow-lg mx-auto animate-pulse"><img src={logo} alt="KF" className="w-full h-full object-contain" /></div>
          <p className="text-sm text-[#666666] font-semibold">Chargement... / جاري التحميل</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-[#666666]">Profil introuvable. Veuillez contacter l'administrateur.</p>
      </div>
    );
  }

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'dean':
    case 'assistant_dean':
      return <DeanDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <AuthPage />;
  }
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DashboardRouter />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
