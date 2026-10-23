import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Lock,
  LogOut,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
  Package,
  Layers,
  Sparkles,
  HeartHandshake,
  UtensilsCrossed,
  Eye,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';
import { FoodDonation, FoodClaim, FoodFeedback } from '../types/donation.ts';
import { formatLocalDateTime, formatPrepDateTime } from '../services/safetyService.ts';

interface ProfilePageProps {
  donations: FoodDonation[];
  claims: FoodClaim[];
  feedbacks: FoodFeedback[];
  onOpenVerifyTokenModal: (prefillToken?: string) => void;
  onOpenFeedbackModal: (claim: FoodClaim) => void;
  onViewDonationDetails: (donation: FoodDonation) => void;
}

export const Profile: React.FC<ProfilePageProps> = ({
  donations,
  claims,
  feedbacks,
  onOpenVerifyTokenModal,
  onOpenFeedbackModal,
  onViewDonationDetails
}) => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { t } = useLanguage();
  const { locationState, navigate } = useNavigation();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'claims' | 'donations' | 'feedback'>(() => {
    return (locationState?.activeTab as any) || 'profile';
  });

  // Edit Profile Modal / State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCity, setEditCity] = useState(user?.city || 'Pune');
  const [phonePrivacy, setPhonePrivacy] = useState(user?.phonePrivacyEnabled || false);

  // Change Password State
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Filter claims & donations relevant to user
  const userClaims = claims.filter(c => c.recipientId === user?.id || c.recipientPhone === user?.phone);
  const userDonations = donations.filter(d => d.donorId === user?.id || d.donorEmail === user?.email);
  const userFeedbacks = feedbacks.filter(f => f.fromUserId === user?.id || f.fromUserName === user?.name);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: editName,
        phone: editPhone,
        city: editCity,
        phonePrivacyEnabled: phonePrivacy
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(currentPass, newPass);
      setPassSuccess('Password updated successfully.');
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setIsChangingPass(false), 1500);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent Member';

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 space-y-6 animate-fade-in">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              {user?.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs border-2 border-white" title="Verified Member">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {user?.role === 'donor' ? 'Food Donor' : user?.role === 'recipient' ? 'Community Recipient' : 'Active Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {user?.city || 'Pune'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Member since {formattedJoinDate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-200 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('profile.editProfile')}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('profile.tabProfile')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{t('profile.tabClaims')} ({userClaims.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>{t('profile.tabDonations')} ({userDonations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-stone-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>{t('profile.tabFeedback')} ({userFeedbacks.length})</span>
          </button>
        </div>

        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Contact & Account Details
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-slate-500 font-semibold">{t('profile.name')}:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-slate-500 font-semibold">{t('profile.email')}:</span>
                  <span className="font-bold text-slate-800">{user?.email}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-slate-500 font-semibold">{t('profile.phone')}:</span>
                  <span className="font-bold text-slate-800">{user?.phone}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-slate-500 font-semibold">{t('profile.city')}:</span>
                  <span className="font-bold text-slate-800">{user?.city}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('profile.phonePrivacyNotice')}</span>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                {t('profile.changePassword')}
              </h3>

              {passError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">{t('profile.confirmNewPassword')}</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t('profile.updatePasswordBtn')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: My Claims History */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                My Food Claims & Pickup Tokens ({userClaims.length})
              </h2>
            </div>

            {userClaims.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={claim.imageUrl}
                            alt={claim.foodName}
                            className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {claim.category}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-1">
                              {claim.foodName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              Donor: {claim.donorName}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            claim.status === 'picked_up'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {claim.status === 'picked_up' ? 'Picked Up' : 'Pending Pickup'}
                        </span>
                      </div>

                      {/* Pickup Token Card */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Verification Token
                          </span>
                          <div className="text-base font-extrabold text-emerald-800 font-mono tracking-wider">
                            {claim.verificationToken}
                          </div>
                        </div>

                        <div className="text-right text-[11px]">
                          <span className="font-bold text-slate-800">
                            {claim.claimedServings} Servings
                          </span>
                          <div className="text-slate-500">
                            {claim.tokenVerified ? '✅ Verified by Donor' : '⏳ Show at Pickup'}
                          </div>
                        </div>
                      </div>

                      {/* Location & Times */}
                      <div className="text-xs space-y-1.5 text-slate-600 border-t border-stone-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pickup Location:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {claim.pickupAddress}, {claim.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pickup Deadline:</span>
                          <span className="font-semibold text-red-700">
                            {formatLocalDateTime(claim.pickupDeadline)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Food Expiry:</span>
                          <span className="font-semibold text-amber-800">
                            {formatLocalDateTime(claim.expiryTimestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Feedback button unlocked ONLY after token verification */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      {claim.status === 'picked_up' && claim.tokenVerified ? (
                        claim.hasRecipientFeedback ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Feedback Submitted
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenFeedbackModal(claim)}
                            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-4 h-4 fill-white" />
                            <span>Rate Food Quality & Handover</span>
                          </button>
                        )
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          🔒 Feedback unlocks once donor verifies token at pickup
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90 shadow-xs space-y-3">
                <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-extrabold text-slate-800 text-base">No Food Claims Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse fresh surplus food available in your city and claim portions to receive your pickup verification token.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700"
                >
                  Browse Available Food
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Donations History */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                My Food Donations ({userDonations.length})
              </h2>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + New Donation
              </button>
            </div>

            {userDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={donation.imageUrl}
                            alt={donation.foodName}
                            className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {donation.category}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-1">
                              {donation.foodName}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold">
                              {donation.remainingServings} / {donation.servings} Servings Remaining
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            donation.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : donation.status === 'claimed'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : donation.status === 'completed'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {donation.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="text-xs space-y-1.5 text-slate-600 border-t border-stone-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Prepared:</span>
                          <span className="font-semibold text-slate-800">
                            {formatPrepDateTime(donation.prepDate, donation.prepTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Food Expiry:</span>
                          <span className="font-bold text-amber-800">
                            {formatLocalDateTime(donation.expiryTimestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pickup Deadline:</span>
                          <span className="font-semibold text-red-700">
                            {formatLocalDateTime(donation.pickupDeadline)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pickup Location:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {donation.pickupAddress}, {donation.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDonationDetails(donation)}
                        className="text-xs font-semibold text-slate-700 hover:text-emerald-700"
                      >
                        View Full Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenVerifyTokenModal()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Verify Token</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90 shadow-xs space-y-3">
                <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-extrabold text-slate-800 text-base">No Donations Listed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Help reduce food waste by sharing extra food from your event, restaurant, or household.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700"
                >
                  Upload Food Donation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: My Feedback History */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Community Ratings & Feedback Submitted ({userFeedbacks.length})
            </h2>

            {userFeedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {fb.fromRole === 'recipient' ? 'Recipient Feedback' : 'Donor Feedback'}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= fb.overallRating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 italic bg-stone-50 p-3 rounded-xl border border-stone-200">
                      "{fb.comments}"
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Food Item: {fb.foodName}</span>
                      <span>{new Date(fb.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90 shadow-xs space-y-3">
                <Star className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-extrabold text-slate-800 text-base">No Feedback Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Feedback becomes unlocked as soon as you complete a verified food pickup.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-5 animate-fade-in">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                {t('profile.editProfile')}
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t('profile.name')}</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t('profile.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t('profile.city')}</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Thane">Thane</option>
                    <option value="Aurangabad">Chhatrapati Sambhajinagar</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    {t('profile.saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};
