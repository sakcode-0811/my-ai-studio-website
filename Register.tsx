import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  MapPin,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { UserRole } from '../types/auth.ts';

export const Register: React.FC = () => {
  const { register, loginDemo } = useAuth();
  const { t } = useLanguage();
  const { locationState, navigate } = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Pune');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<UserRole>('both');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const returnUrl = locationState?.returnUrl || '/';
  const claimDonationId = locationState?.claimDonationId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError(t('auth.errorMissingFields'));
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        city,
        password,
        accountType
      });

      setSuccess(t('auth.regSuccess'));

      setTimeout(() => {
        // Return to intended page with preserved state (e.g. claimDonationId)
        navigate(returnUrl, {
          state: {
            claimDonationId,
            autoOpenClaim: !!claimDonationId
          },
          replace: true
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoRegister = async (role: 'donor' | 'recipient') => {
    setIsLoading(true);
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
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            {t('auth.registerSubtitle')}
          </p>

          {/* Context banner if arriving from claim or donate button */}
          {returnUrl === '/upload' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              ✨ Register to upload your surplus food donation and help reduce hunger.
            </div>
          )}
          {claimDonationId && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✨ Register to claim this food donation and receive your pickup verification token.
            </div>
          )}
        </div>

        {/* Error / Success Alerts */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {t('auth.fullName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.fullNamePlaceholder')}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {t('auth.email')} *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Phone & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t('auth.phone')} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t('auth.city')} *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Nashik">Nashik</option>
                <option value="Thane">Thane</option>
                <option value="Aurangabad">Chhatrapati Sambhajinagar</option>
                <option value="Other">Other City</option>
              </select>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                {t('auth.password')} *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                {t('auth.confirmPassword')} *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Account Usage Preference */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-700">
              {t('auth.accountType')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  accountType === 'recipient'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={accountType === 'recipient'}
                  onChange={() => setAccountType('recipient')}
                  className="accent-teal-600"
                />
                <span>Claim Food</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  accountType === 'donor'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={accountType === 'donor'}
                  onChange={() => setAccountType('donor')}
                  className="accent-emerald-600"
                />
                <span>Donate Food</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  accountType === 'both'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="accType"
                  checked={accountType === 'both'}
                  onChange={() => setAccountType('both')}
                  className="accent-indigo-600"
                />
                <span>Both</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>{t('auth.registerBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Link to Login preserving destination */}
        <div className="pt-3 border-t border-stone-100 text-center text-xs text-slate-600">
          <span>{t('auth.alreadyAccount')} </span>
          <button
            type="button"
            onClick={() =>
              navigate('/login', {
                state: { returnUrl, claimDonationId }
              })
            }
            className="font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            {t('auth.loginBtn')}
          </button>
        </div>

        {/* Quick Demo Registration / Instant Logins */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            {t('auth.quickDemoLogin')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoRegister('recipient')}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-center transition-all cursor-pointer"
            >
              {t('auth.demoRecipientBtn')}
            </button>
            <button
              type="button"
              onClick={() => handleDemoRegister('donor')}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-center transition-all cursor-pointer"
            >
              {t('auth.demoDonorBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
