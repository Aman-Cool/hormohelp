import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ShopPage from './pages/ShopPage';
import SymptomTrackerPage from './pages/SymptomTrackerPage';
import EducationPage from './pages/EducationPage';
import CommunityPage from './pages/CommunityPage';
import ConsultationsPage from './pages/ConsultationsPage';

function ProtectedRoute({ element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBEF]">
      <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? element : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<ProtectedRoute element={<OnboardingPage />} />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/shop" element={<ProtectedRoute element={<ShopPage />} />} />
      <Route path="/symptom-tracker" element={<ProtectedRoute element={<SymptomTrackerPage />} />} />
      <Route path="/education" element={<ProtectedRoute element={<EducationPage />} />} />
      <Route path="/community" element={<ProtectedRoute element={<CommunityPage />} />} />
      <Route path="/consultations" element={<ProtectedRoute element={<ConsultationsPage />} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
