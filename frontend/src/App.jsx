import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import './i18n';

// Lazy loaded pages for ultra-light initial bundle (<2GB RAM friendly)
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));

const FarmerHome = lazy(() => import('./pages/farmer/FarmerHome'));
const CropRecommendationPage = lazy(() => import('./pages/farmer/CropRecommendationPage'));
const DiseaseDetectionPage = lazy(() => import('./pages/farmer/DiseaseDetectionPage'));
const FertilizerPage = lazy(() => import('./pages/farmer/FertilizerPage'));
const YieldPredictionPage = lazy(() => import('./pages/farmer/YieldPredictionPage'));
const ReportsPage = lazy(() => import('./pages/farmer/ReportsPage'));
const SensorDataPage = lazy(() => import('./pages/farmer/SensorDataPage'));
const FarmerProfilePage = lazy(() => import('./pages/farmer/FarmerProfilePage'));
const HelpPage = lazy(() => import('./pages/farmer/HelpPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminModels = lazy(() => import('./pages/admin/AdminModels'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));

// Route Protectors
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (profile?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin"></div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineSyncProvider>
          <div className="min-h-screen flex flex-col bg-emerald-50/40 text-stone-900 font-sans">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Farmer Protected Routes */}
                  <Route path="/home" element={<ProtectedRoute><FarmerHome /></ProtectedRoute>} />
                  <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendationPage /></ProtectedRoute>} />
                  <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetectionPage /></ProtectedRoute>} />
                  <Route path="/fertilizer" element={<ProtectedRoute><FertilizerPage /></ProtectedRoute>} />
                  <Route path="/yield-prediction" element={<ProtectedRoute><YieldPredictionPage /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                  <Route path="/sensors" element={<ProtectedRoute><SensorDataPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><FarmerProfilePage /></ProtectedRoute>} />
                  <Route path="/help" element={<HelpPage />} />

                  {/* Admin Protected Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="/admin/models" element={<AdminRoute><AdminModels /></AdminRoute>} />
                  <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                  <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster position="bottom-center" toastOptions={{ duration: 4000 }} />
          </div>
        </OfflineSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
