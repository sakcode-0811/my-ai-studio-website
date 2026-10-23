import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Utensils,
  Layers,
  Map,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  HandHeart,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { FoodDonation, FoodCategory, FoodClaim, FoodFeedback } from '../types/donation.ts';
import { FoodCard } from './FoodCard.tsx';
import { InteractiveMapFeed } from './InteractiveMapFeed.tsx';
import { filterActiveFeed } from '../services/donationService.ts';
import { formatLocalDateTime } from '../services/safetyService.ts';
import { FeedbackView } from './FeedbackView.tsx';

interface RecipientDashboardProps {
  donations: FoodDonation[];
  claims: FoodClaim[];
  feedbacks: FoodFeedback[];
  userCity?: string;
  onViewDetails: (donation: FoodDonation) => void;
  onClaimFood: (donation: FoodDonation) => void;
  onOpenUploadModal: () => void;
  onOpenFeedbackModal: (claim: FoodClaim) => void;
}

export const RecipientDashboard: React.FC<RecipientDashboardProps> = ({
  donations,
  claims,
  feedbacks,
  userCity = 'Pune',
  onViewDetails,
  onClaimFood,
  onOpenUploadModal,
  onOpenFeedbackModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FoodCategory>('all');
  const [cityFilter, setCityFilter] = useState<string>(userCity);
  const [showAllHistory, setShowAllHistory] = useState(false); // default: hide expired or unavailable per requirement
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [activeTab, setActiveTab] = useState<'available' | 'my_claims' | 'feedback'>('available');

  // Filter based on active food feed rule:
  // "Hide expired or unavailable listings from the active food feed."
  const baseList = filterActiveFeed(donations, showAllHistory);

  const filteredDonations = baseList.filter(d => {
    // City filter
    if (cityFilter && cityFilter !== 'all') {
      if (d.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && d.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = d.foodName.toLowerCase().includes(q);
      const matchCity = d.city.toLowerCase().includes(q);
      const matchAddress = d.pickupAddress.toLowerCase().includes(q);
      const matchLandmark = (d.landmark || '').toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchIngredients = (d.ingredients || '').toLowerCase().includes(q);
      return matchName || matchCity || matchAddress || matchLandmark || matchDesc || matchIngredients;
    }

    return true;
  });

  const availableCount = filteredDonations.filter(d => d.status === 'available').length;
  const totalServingsAvailable = filteredDonations
    .filter(d => d.status === 'available')
    .reduce((sum, d) => sum + (d.remainingServings !== undefined ? d.remainingServings : d.servings), 0);

  const myClaims = claims;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Surplus Food Feed • {userCity}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Surplus Meals for Rescue & Redistribution
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
            All listings display exact preparation time, mandatory food expiry time, holding conditions, and Leaflet pickup GPS pins to guarantee safety before claiming.
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
          <span className="text-xs text-emerald-200 font-medium">Available in {cityFilter === 'all' ? 'All Cities' : cityFilter}:</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {totalServingsAvailable} Servings ({availableCount} items)
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by food name (Biryani, Chapati, Rice), ingredients, or landmark..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="Pune">Pune (Registered City)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="all">All Cities</option>
            </select>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter('vegetarian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                categoryFilter === 'vegetarian'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
              Veg
            </button>
            <button
              onClick={() => setCategoryFilter('non-vegetarian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                categoryFilter === 'non-vegetarian'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 border border-white"></span>
              Non-Veg
            </button>
          </div>

          {/* View toggle (Grid / Map) */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              City Map
            </button>
          </div>
        </div>

        {/* Tab Row: Available Feed vs My Claims vs Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-1 font-bold border-b-2 transition-all ${
                activeTab === 'available'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Available Food Feed ({availableCount})
            </button>
            <button
              onClick={() => setActiveTab('my_claims')}
              className={`pb-1 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'my_claims'
                  ? 'border-indigo-600 text-indigo-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              My Claims & Pickup Tokens ({myClaims.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`pb-1 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'feedback'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback ({feedbacks.length})
            </button>
          </div>

          {/* Toggle for requirement: "Remove expired food from the active recipient feed." */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
            <input
              type="checkbox"
              checked={showAllHistory}
              onChange={e => setShowAllHistory(e.target.checked)}
              className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-[11px]">
              {showAllHistory ? 'Showing all listings (including expired)' : 'Active Feed: Hiding expired & completed listings'}
            </span>
          </label>
        </div>
      </div>

      {/* Tab 1: Available Food Feed (Grid or Map) */}
      {activeTab === 'available' && (
        <>
          {viewMode === 'map' ? (
            <InteractiveMapFeed
              donations={filteredDonations}
              onSelectDonation={onViewDetails}
              onClaimDonation={onClaimFood}
            />
          ) : (
            <>
              {filteredDonations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                  <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-semibold text-slate-700">No available food in {cityFilter === 'all' ? 'the network' : cityFilter}</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchTerm
                      ? `No meals found matching "${searchTerm}". Try broadening search terms or switching cities.`
                      : 'Expired or fully claimed listings are hidden from the active feed. Check back shortly for new banquet donations.'}
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setCityFilter('all'); setShowAllHistory(true); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Show All Cities & History
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDonations.map(donation => (
                    <FoodCard
                      key={donation.id}
                      donation={donation}
                      onViewDetails={onViewDetails}
                      onClaim={onClaimFood}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Tab 2: My Claims & Verification Tokens */}
      {activeTab === 'my_claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">Your Claimed Food & Pickup Verification Tokens</h2>
            <p className="text-xs text-slate-500">
              Present your verification token to the donor when collecting food. Once verified, feedback becomes available.
            </p>
          </div>

          {myClaims.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <KeyRound className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">You haven't claimed any meals yet</h3>
              <p className="text-xs text-slate-400">
                Browse the Available Food Feed and claim surplus meals to receive verification tokens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myClaims.map(claim => (
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
                          claim.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {claim.status === 'picked_up' ? 'Picked Up & Verified' : 'Awaiting Pickup'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-3">
                        <span>Donor: <strong>{claim.donorName}</strong></span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Phone className="w-3 h-3" /> {claim.donorPhone}
                        </span>
                        <span>Claimed: <strong>{claim.claimedServings} Servings</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3">
                        <span className="flex items-center gap-1 text-red-700 font-medium">
                          <Clock className="w-3 h-3 text-red-500" />
                          Collect before: {formatLocalDateTime(claim.pickupDeadline)}
                        </span>
                        <span className="text-amber-800 font-medium">
                          Expires: {formatLocalDateTime(claim.expiryTimestamp)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Pickup: {claim.pickupAddress}, {claim.city}</span>
                        {claim.landmark && <span>({claim.landmark})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Pickup Token</span>
                      <span className="font-mono font-extrabold text-sm text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 inline-block shadow-2xs">
                        {claim.verificationToken}
                      </span>
                    </div>

                    {claim.status === 'picked_up' && (
                      <button
                        type="button"
                        onClick={() => onOpenFeedbackModal(claim)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {claim.hasRecipientFeedback ? 'View Feedback' : 'Give Feedback'}
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
          userRole="recipient"
          claims={claims}
          feedbacks={feedbacks}
          onOpenFeedbackModal={onOpenFeedbackModal}
        />
      )}
    </div>
  );
};
