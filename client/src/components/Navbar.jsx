import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Map, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              TurfHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-2'
                      : 'text-gray-700 hover:text-teal-600'
                  }`}
                >
                  Browse Turfs
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive('/map')
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-2'
                      : 'text-gray-700 hover:text-teal-600'
                  }`}
                >
                  <Map size={18} />
                  Map
                </Link>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive('/bookings')
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-2'
                      : 'text-gray-700 hover:text-teal-600'
                  }`}
                >
                  <BookOpen size={18} />
                  My Bookings
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'text-red-600 border-b-2 border-red-600 pb-2'
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    🎛️ Admin
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-teal-100 text-teal-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Turfs
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/map')
                      ? 'bg-teal-100 text-teal-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Map size={18} />
                  Map
                </Link>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/bookings')
                      ? 'bg-teal-100 text-teal-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen size={18} />
                  My Bookings
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-red-100 text-red-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🎛️ Admin Panel
                  </Link>
                )}

                <div className="px-3 py-3 border-t border-gray-200 mt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{user?.name}</p>
                  <p className="text-xs text-gray-600 mb-3">{user?.email}</p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
