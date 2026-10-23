import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';

export const Login: React.FC = () => {
  const { login, loginDemo, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const { locationState, navigate } = useNavigation();

  const [email, setEmail] = useState('chef.rajesh@orchidhotel.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const returnUrl = locationState?.returnUrl || '/';
  const claimDonationId = locationState?.claimDonationId;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(t('auth.errorMissingFields'));
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setSuccess(t('auth.loginSuccess'));

      setTimeout(() => {
        navigate(returnUrl, {
          state: {
            claimDonationId,
            autoOpenClaim: !!claimDonationId
          },
          replace: true
        });
      }, 700);
    } catch (err: any) {
      setError(err.message || t('auth.errorInvalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate(returnUrl, {
        state: {
          claimDonationId,
          autoOpenClaim: !!claimDonationId
        },
        replace: true
      });
    } catch (err: any) {
      setError('Google Sign-In was cancelled or unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'donor' | 'recipient') => {
    setIsLoading(true);
    setError(null);
    try {
      await loginDemo(role);
      navigate(returnUrl, {
        state: {
          claimDonationId,
          autoOpenClaim: !!claimDonationId
        },
        replace: true
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
            {t('auth.loginSubtitle')}
          </p>

          {/* Context banner */}
          {returnUrl === '/upload' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              ✨ Sign in to upload food and access your donation dashboard.
            </div>
          )}
          {claimDonationId && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✨ Sign in to confirm your pickup claim and receive verification token.
            </div>
          )}
        </div>

        {/* Error / Success message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {t('auth.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              {t('auth.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>{t('auth.loginBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Google sign-in */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">
              {t('auth.orContinueWith')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('auth.googleSignIn')}</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="pt-2 border-t border-stone-100 text-center text-xs text-slate-600">
          <span>{t('auth.dontHaveAccount')} </span>
          <button
            type="button"
            onClick={() =>
              navigate('/register', {
                state: { returnUrl, claimDonationId }
              })
            }
            className="font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            {t('auth.registerBtn')}
          </button>
        </div>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            {t('auth.quickDemoLogin')}
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('donor')}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{t('auth.demoDonorBtn')}</span>
              <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-md font-bold">Pune</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('recipient')}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{t('auth.demoRecipientBtn')}</span>
              <span className="text-[10px] bg-teal-200/80 px-2 py-0.5 rounded-md font-bold">Pune</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
