import React, { useState } from 'react';
import {
  UtensilsCrossed,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Code2,
  LogIn,
  LogOut,
  User as UserIcon,
  HeartHandshake,
  KeyRound,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { NotificationBell } from './NotificationBell.tsx';

interface NavbarProps {
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenVerifyTokenModal: () => void;
  onOpenSafetyModal: () => void;
  onOpenApiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenVerifyTokenModal,
  onOpenSafetyModal,
  onOpenApiModal
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { currentPath, navigate } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDonateClick = () => {
    if (isAuthenticated) {
      navigate('/upload');
    } else {
      // Scenario B: Visitor clicks Donate Food -> redirect to register with returnUrl=/upload
      navigate('/register', { state: { returnUrl: '/upload' } });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none flex items-center gap-1.5">
                {t('nav.brandName')}
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {t('nav.badge')}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t('nav.tagline')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentPath === '/' || currentPath === '/claim'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.claimFood')}</span>
            </button>

            <button
              onClick={() => navigate('/map')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentPath === '/map'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{t('nav.cityMap')}</span>
            </button>

            <button
              onClick={onOpenSafetyModal}
              className="px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 hover:text-slate-900 hover:bg-stone-100 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t('nav.safetyRules')}</span>
            </button>

            <button
              onClick={onOpenApiModal}
              className="px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 hover:text-slate-900 hover:bg-stone-100 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>{t('nav.apiExplorer')}</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notification Bell */}
            <NotificationBell
              unreadCount={unreadNotificationsCount}
              onClick={onOpenNotifications}
            />

            {/* Token Verification Quick Button */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onOpenVerifyTokenModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors border border-stone-200 cursor-pointer"
                title="Verify recipient pickup token"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('nav.verifyToken')}</span>
              </button>
            )}

            {/* Prominent Donate / Upload Food CTA */}
            <button
              type="button"
              onClick={handleDonateClick}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.donateFood')}</span>
              <span className="sm:hidden">Donate</span>
            </button>

            {/* User Profile / Auth Links */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className={`flex items-center gap-2 p-1 rounded-xl transition-all cursor-pointer ${
                    currentPath === '/profile'
                      ? 'ring-2 ring-emerald-500 bg-emerald-50'
                      : 'hover:bg-stone-100'
                  }`}
                  title="My Profile & History"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl border border-emerald-500 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 hidden xl:inline max-w-[110px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { returnUrl: currentPath } })}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/register', { state: { returnUrl: currentPath } })}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <span>{t('nav.register')}</span>
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-stone-200 space-y-2 animate-fade-in text-xs font-semibold">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.claimFood')}</span>
            </button>

            <button
              onClick={() => {
                navigate('/map');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{t('nav.cityMap')}</span>
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span>{t('nav.profile')}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenVerifyTokenModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2 text-indigo-700"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{t('nav.verifyToken')}</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                onOpenSafetyModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t('nav.safetyRules')}</span>
            </button>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-stone-200 flex gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center rounded-xl font-bold bg-stone-100 text-slate-700"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center rounded-xl font-bold bg-emerald-600 text-white"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
