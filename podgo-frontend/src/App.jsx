import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DriverSetupPage from './pages/DriverSetupPage';
import ProfilePage from './pages/ProfilePage';
import OfferRidePage from './pages/OfferRidePage';
import FindRidePage from './pages/FindRidePage';
import SearchResultsPage from './pages/SearchResultsPage';
import TripHistoryPage from './pages/TripHistoryPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import DriverVerificationPage from './pages/admin/DriverVerificationPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AllRidesPage from './pages/admin/AllRidesPage';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('podgo-theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  return (
    <Router>
      <div className="md:max-w-[420px] md:mx-auto md:min-h-dvh md:border-x md:border-outline-variant/30 md:shadow-2xl relative overflow-x-hidden bg-surface flex flex-col min-h-dvh translate-x-0">
        <Toaster position="top-right" duration={4000} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver-setup" 
            element={
              <ProtectedRoute>
                <DriverSetupPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offer-ride" 
            element={
              <ProtectedRoute>
                <OfferRidePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/find-ride" 
            element={
              <ProtectedRoute>
                <FindRidePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search-results" 
            element={
              <ProtectedRoute>
                <SearchResultsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips" 
            element={
              <ProtectedRoute>
                <TripHistoryPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="verifications" element={<DriverVerificationPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="rides" element={<AllRidesPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
