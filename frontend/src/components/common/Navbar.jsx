import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import SpeechButton from './SpeechButton';
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  Globe, 
  User, 
  LogOut, 
  ShieldAlert, 
  RefreshCw, 
  Menu, 
  X,
  FileText,
  Activity,
  HelpCircle,
  Home,
  Info,
  Mail,
  Camera,
  FlaskConical,
  TrendingUp,
  Volume2
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, profile, isAdmin, logout } = useAuth();
  const { isOnline, unsyncedCount, syncNow, isSyncing } = useOfflineSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ha' ? 'en' : 'ha';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-emerald-900 border-b border-emerald-950/80 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 border border-emerald-500/50 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-600 transition-colors">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">AgriYield</span>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs">AI</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-medium hidden sm:block">Jos South, Plateau State</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {user ? (
              <>
                <Link 
                  to="/home" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/home') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('nav_home')}</span>
                </Link>
                <Link 
                  to="/disease-detection" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/disease-detection') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Disease Scan</span>
                </Link>
                <Link 
                  to="/crop-recommendation" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/crop-recommendation') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Crop Match</span>
                </Link>
                <Link 
                  to="/fertilizer" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/fertilizer') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Fertilizer</span>
                </Link>
                <Link 
                  to="/yield-prediction" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/yield-prediction') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Yield</span>
                </Link>
                <Link 
                  to="/reports" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/reports') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('nav_reports')}</span>
                </Link>
                <Link 
                  to="/sensors" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/sensors') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Telemetry</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/about') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Info className="w-3.5 h-3.5 text-emerald-300" />
                  <span>About</span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/contact') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Contact</span>
                </Link>
                <Link 
                  to="/help" 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isActive('/help') 
                      ? 'bg-emerald-800 text-white shadow-xs' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Help</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                className="ml-2 text-amber-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-950" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center gap-2">
            
            {/* Quick Page Audio Reader */}
            <SpeechButton 
              readPage={true} 
              className="bg-emerald-800/80 hover:bg-emerald-700 text-white border-emerald-700 text-[11px] px-2.5 py-1.5" 
              label="Listen"
            />

            {/* Sync / Online Status Badge */}
            <div className="flex items-center">
              {isOnline ? (
                <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-200 text-[11px] px-2.5 py-1.5 rounded-xl border border-emerald-700/60 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <Wifi className="w-3 h-3 hidden sm:inline text-emerald-400" />
                  <span className="hidden sm:inline">{t('online')}</span>
                  {unsyncedCount > 0 && (
                    <button 
                      onClick={syncNow}
                      disabled={isSyncing}
                      className="ml-1 bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-1 hover:bg-amber-300 cursor-pointer"
                      title="Sync offline records"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {unsyncedCount}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-200 text-[11px] px-2.5 py-1.5 rounded-xl border border-amber-400/40 font-medium">
                  <WifiOff className="w-3 h-3 text-amber-300" />
                  <span>{t('offline')}</span>
                  {unsyncedCount > 0 && (
                    <span className="bg-amber-400 text-stone-950 text-[10px] px-1.5 py-0.2 rounded-md font-black ml-1">
                      {unsyncedCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-700 bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              aria-label="Switch language"
              title="Toggle Hausa / English"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{i18n.language === 'ha' ? 'Hausa' : 'English'}</span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-emerald-100 font-bold hover:bg-emerald-700 hover:text-white transition-colors"
                  title={profile?.fullName || 'Farmer Profile'}
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-emerald-200 hover:text-red-300 rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
                  title="Sign Out to Landing Page"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <Link
                  to="/login"
                  className="text-emerald-100 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-emerald-100 hover:text-white rounded-xl hover:bg-emerald-800 focus:outline-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-emerald-800/80 space-y-1.5 bg-emerald-950/95 backdrop-blur-md rounded-b-2xl px-2 shadow-xl animate-in slide-in-from-top-2">
            {user ? (
              <>
                <Link 
                  to="/home" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>{t('nav_home')} Dashboard</span>
                </Link>
                <Link 
                  to="/disease-detection" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Leaf Disease Diagnosis</span>
                </Link>
                <Link 
                  to="/crop-recommendation" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>Crop Suitability Match</span>
                </Link>
                <Link 
                  to="/fertilizer" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>Fertilizer Advisory</span>
                </Link>
                <Link 
                  to="/yield-prediction" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Yield Forecast</span>
                </Link>
                <Link 
                  to="/reports" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Diagnostic Reports</span>
                </Link>
                <Link 
                  to="/sensors" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Telemetry & Sensors</span>
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Farmer Profile</span>
                </Link>
                <Link 
                  to="/help" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Help & Advisory</span>
                </Link>

                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-950 bg-amber-400 text-xs font-black hover:bg-amber-300 transition-colors mt-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-stone-950" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-950/40 text-xs font-bold text-left transition-colors cursor-pointer border-t border-emerald-900 mt-2 pt-3"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out to Landing Page</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>About AgriYield</span>
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Contact Extension Support</span>
                </Link>
                <Link 
                  to="/help" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Farmer Help Guide</span>
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl border border-emerald-700 bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-amber-400 text-stone-950 text-xs font-black hover:bg-amber-300"
                  >
                    Register Free
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
