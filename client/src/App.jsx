import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const TurfDetailsPage = lazy(() => import('./pages/TurfDetailsPage'));
const BookingHistoryPage = lazy(() => import('./pages/BookingHistoryPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();

  return <Navigate to={isAuthenticated ? '/map' : '/login'} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
              <Navbar />
              <main className="min-h-screen">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/map"
                      element={
                        <ProtectedRoute>
                          <MapPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bookings"
                      element={
                        <ProtectedRoute>
                          <BookingHistoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/turf/:id"
                      element={
                        <ProtectedRoute>
                          <TurfDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      }
                    />
                    <Route path="/" element={<HomeRedirect />} />
                    <Route
                      path="*"
                      element={
                        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
                          <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                            <p className="text-xl text-gray-600 mb-6">Page not found</p>
                            <a href="/dashboard" className="text-teal-600 hover:text-teal-700 font-semibold">
                              ← Back to Dashboard
                            </a>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Toast />
            </div>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

