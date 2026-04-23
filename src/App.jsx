import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import AIChatWidget from './components/AIChatWidget';

const HomePage            = lazy(() => import('./pages/HomePage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const SignupPage          = lazy(() => import('./pages/SignupPage'));
const OnboardingPage      = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage       = lazy(() => import('./pages/DashboardPage'));
const ShopPage            = lazy(() => import('./pages/ShopPage'));
const SymptomTrackerPage  = lazy(() => import('./pages/SymptomTrackerPage'));
const EducationPage       = lazy(() => import('./pages/EducationPage'));
const CommunityPage       = lazy(() => import('./pages/CommunityPage'));
const ConsultationsPage   = lazy(() => import('./pages/ConsultationsPage'));
const VerifyEmailPage     = lazy(() => import('./pages/VerifyEmailPage'));
const PrivacyPolicyPage   = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage  = lazy(() => import('./pages/TermsOfServicePage'));
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'));

const PAGE_TITLES = {
  '/':                'HarmoHelp — Hormonal Wellness',
  '/login':           'Sign In — HarmoHelp',
  '/signup':          'Create Account — HarmoHelp',
  '/verify-email':    'Verify Email — HarmoHelp',
  '/onboarding':      'Get Started — HarmoHelp',
  '/dashboard':       'Dashboard — HarmoHelp',
  '/shop':            'Health & Wellness Shop — HarmoHelp',
  '/symptom-tracker': 'Symptom Tracker — HarmoHelp',
  '/education':       'Education — HarmoHelp',
  '/community':       'Community Hub — HarmoHelp',
  '/consultations':   'Book a Consultation — HarmoHelp',
  '/privacy':         'Privacy Policy — HarmoHelp',
  '/terms':           'Terms of Service — HarmoHelp',
};

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBEF]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-navy border-t-[#D4B83A] rounded-full animate-spin" />
        <p className="text-navy font-medium text-sm">Loading…</p>
      </div>
    </div>
  );
}

function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'HarmoHelp — Hormonal Wellness';
  }, [pathname]);
  return null;
}

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
    <>
      <RouteTitle />
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/signup"          element={<SignupPage />} />
          <Route path="/verify-email"    element={<VerifyEmailPage />} />
          <Route path="/privacy"         element={<PrivacyPolicyPage />} />
          <Route path="/terms"           element={<TermsOfServicePage />} />
          <Route path="/onboarding"      element={<ProtectedRoute element={<OnboardingPage />} />} />
          <Route path="/dashboard"       element={<ProtectedRoute element={<DashboardPage />} />} />
          <Route path="/shop"            element={<ProtectedRoute element={<ShopPage />} />} />
          <Route path="/symptom-tracker" element={<ProtectedRoute element={<SymptomTrackerPage />} />} />
          <Route path="/education"       element={<ProtectedRoute element={<EducationPage />} />} />
          <Route path="/community"       element={<ProtectedRoute element={<CommunityPage />} />} />
          <Route path="/consultations"   element={<ProtectedRoute element={<ConsultationsPage />} />} />
          <Route path="*"               element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <CookieBanner />
          <AIChatWidget />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#1a1a2e',
                color: '#fff',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#D4B83A', secondary: '#1a1a2e' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: {
                  background: '#fff',
                  color: '#1a1a2e',
                  border: '1px solid #fecaca',
                },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
