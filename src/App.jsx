import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
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
import { AuthContext } from './context/AuthContext';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={user ? <OnboardingPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/shop" element={user ? <ShopPage /> : <Navigate to="/login" />} />
          <Route path="/symptom-tracker" element={user ? <SymptomTrackerPage /> : <Navigate to="/login" />} />
          <Route path="/education" element={user ? <EducationPage /> : <Navigate to="/login" />} />
          <Route path="/community" element={user ? <CommunityPage /> : <Navigate to="/login" />} />
          <Route path="/consultations" element={user ? <ConsultationsPage /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
