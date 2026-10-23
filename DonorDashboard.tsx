import React, { useState } from 'react';
import {
  PlusCircle,
  Package,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Trash2,
  Users,
  Eye,
  Check,
  ShieldCheck,
  ShieldAlert,
  Phone,
  KeyRound,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { FoodDonation, FoodClaim, FoodFeedback } from '../types/donation.ts';
import { formatLocalDateTime, formatPrepDateTime, formatRelativeTime } from '../services/safetyService.ts';
import { FeedbackView } from './FeedbackView.tsx';

interface DonorDashboardProps {
  donations: FoodDonation[];
  claims: FoodClaim[];
  feedbacks: FoodFeedback[];
  onOpenUploadModal: () => void;
  onOpenVerifyTokenModal: (prefillToken?: string) => void;
  onViewDetails: (donation: FoodDonation) => void;
  onUpdateStatus: (donationId: string, status: 'completed' | 'cancelled') => void;
  onDeleteDonation: (donationId: string) => void;
  onOpenFeedbackModal: (claim: FoodClaim) => void;
  currentUserId?: string;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  donations,
  claims,
  feedbacks,
  onOpenUploadModal,
  onOpenVerifyTokenModal,
  onViewDetails,
  onUpdateStatus,
  onDeleteDonation,
  onOpenFeedbackModal,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'claims' | 'feedback'>('listings');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed' | 'completed' | 'expired'>('all');

  const donorDonations = donations;
  const pendingClaims = claims.filter(c => c.status === 'pending_pickup');

  const totalServings = donorDonations.reduce((sum, d) => sum + (d.status !== 'cancelled' ? d.servings : 0), 0);
  const activeCount = donorDonations.filter(d => d.status === 'available').length;
  const claimedCount = donorDonations.filter(d => d.status === 'claimed').length;
  const completedCount = donorDonations.filter(d => d.status === 'completed').length;
  const expiredCount = donorDonations.filter(d => d.status === 'expired').length;

  const filteredDonations = donorDonations.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Food Donor Management Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Surplus Food Dispatch & Verification
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Record meals with preparation & expiry timestamps, manage claims from local shelters, verify recipient tokens, and submit donor feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenVerifyTokenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-emerald-950 font-bold rounded-xl shadow-md transition-all text-xs"
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Verify Pickup Token
            {pendingClaims.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl shadow-md transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Donate Food
          </button>
        </div>
      </div>

      {/* Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Servings Donated</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
            <Users className="w-5 h-5 text-emerald-500" />
            {totalServings}
          </div>
          <span className="text-[11px] text-slate-400">Total surplus saved</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Ready for Pickup</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 flex items-center gap-1">
            <Clock className="w-5 h-5 text-blue-500" />
            {activeCount}
          </div>
          <span className="text-[11px] text-slate-400">Available in city feed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Claimed / Token Pending</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-1">
            <KeyRound className="w-5 h-5 text-amber-500" />
            {claimedCount}
          </div>
          <span className="text-[11px] text-slate-400">{pendingClaims.length} awaiting verification</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Completed Pickups</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {completedCount}
          </div>
          <span className="text-[11px] text-slate-400">Handed over & verified</span>
        </div>
      </div>

      {/* Donor Sub-Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'listings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Food Listings ({donorDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Claims & Token Verification ({claims.length})
            {pendingClaims.length > 0 && (
              <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingClaims.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Feedback ({feedbacks.length})
          </button>
        </div>

        {activeTab === 'listings' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px]">Filter status:</span>
            {(['all', 'available', 'claimed', 'completed', 'expired'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                  statusFilter === st ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Listings View */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Published Food Donations</h2>
              <p className="text-xs text-slate-500">
                Track preparation times, mandatory food expiry times, pickup deadlines, and claim tokens.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload Food Item
            </button>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">No donations found in this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Record any surplus catering or banquet food to connect with shelters before expiry.
              </p>
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow hover:bg-emerald-700"
              >
                Upload Food
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDonations.map(donation => {
                const prepDisplay = formatPrepDateTime(donation.prepDate, donation.prepTime);
                const expiryDisplay = formatLocalDateTime(donation.expiryTimestamp);
                const deadlineDisplay = formatLocalDateTime(donation.pickupDeadline);
                const relativePrep = formatRelativeTime(donation.prepTimestamp, true);
                const isExpired = donation.status === 'expired';

                return (
                  <div key={donation.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Food Info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={donation.imageUrl}
                        alt={donation.foodName}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${donation.category === 'vegetarian' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {donation.foodName}
                          </h3>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            {donation.remainingServings} of {donation.servings} Servings Available
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            donation.status === 'available' ? 'bg-blue-100 text-blue-800' :
                            donation.status === 'claimed' ? 'bg-amber-100 text-amber-800' :
                            donation.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {donation.status === 'expired' ? 'Expired' : donation.status}
                          </span>
                        </div>

                        {/* Prep, Expiry & Pickup Timestamps */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            Prepared: <strong className="text-slate-800">{prepDisplay}</strong> ({relativePrep})
                          </span>
                          <span className="flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            Expiry: <strong className={isExpired ? 'text-red-600 line-through' : 'text-amber-900'}>{expiryDisplay}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-red-500" />
                            Deadline: <strong className="text-slate-800">{deadlineDisplay}</strong>
                          </span>
                        </div>

                        {/* Location */}
                        <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{donation.pickupAddress}, {donation.city}</span>
                          {donation.landmark && <span className="text-slate-400">({donation.landmark})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onViewDetails(donation)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      {donation.status === 'claimed' && (
                        <button
                          type="button"
                          onClick={() => onOpenVerifyTokenModal(donation.verificationToken)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify Token
                        </button>
                      )}

                      {donation.status === 'available' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(donation.id, 'cancelled')}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteDonation(donation.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Claims & Token Verification View */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recipient Claims & Token Verification</h2>
              <p className="text-xs text-slate-500">
                When a recipient arrives, enter their 6-character token to verify and complete handover.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenVerifyTokenModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              Verify Token
            </button>
          </div>

          {claims.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <KeyRound className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No food claims recorded yet</h3>
              <p className="text-xs text-slate-400">
                Whenever a recipient or shelter claims food, their claim and verification token will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claims.map(claim => (
                <div key={claim.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={claim.imageUrl}
                      alt={claim.foodName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{claim.foodName}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          claim.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {claim.status === 'picked_up' ? 'Picked Up & Verified' : 'Awaiting Token Verification'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-3">
                        <span>Recipient: <strong>{claim.recipientName}</strong> ({claim.recipientOrg})</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Phone className="w-3 h-3" /> {claim.recipientPhone}
                        </span>
                        <span>Servings: <strong>{claim.claimedServings}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>Deadline: {formatLocalDateTime(claim.pickupDeadline)}</span>
                        <span>•</span>
                        <span>Claimed: {formatLocalDateTime(claim.claimedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Token</span>
                      <span className="font-mono font-extrabold text-sm text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 inline-block">
                        {claim.verificationToken}
                      </span>
                    </div>

                    {claim.status === 'pending_pickup' ? (
                      <button
                        type="button"
                        onClick={() => onOpenVerifyTokenModal(claim.verificationToken)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Verify
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenFeedbackModal(claim)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {claim.hasDonorFeedback ? 'View Review' : 'Give Feedback'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Feedback Tab */}
      {activeTab === 'feedback' && (
        <FeedbackView
          userRole="donor"
          claims={claims}
          feedbacks={feedbacks}
          onOpenFeedbackModal={onOpenFeedbackModal}
        />
      )}
    </div>
  );
};
