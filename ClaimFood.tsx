import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FoodDonation, FoodCategory } from '../types/donation.ts';
import { FoodCard } from '../components/FoodCard.tsx';
import { FoodFilters } from '../components/FoodFilters.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { filterActiveFeed } from '../services/donationService.ts';

interface ClaimFoodPageProps {
  donations: FoodDonation[];
  onViewDetails: (donation: FoodDonation) => void;
  onInitiateClaim: (donation: FoodDonation) => void;
}

export const ClaimFood: React.FC<ClaimFoodPageProps> = ({
  donations,
  onViewDetails,
  onInitiateClaim
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { navigate } = useNavigation();

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FoodCategory>('all');
  
  // City filter defaults to user's registered city if authenticated, or 'Pune' / 'all' for visitors
  const [cityFilter, setCityFilter] = useState<string>(() => {
    return user?.city || 'Pune';
  });

  // Extract unique available cities from donations
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    donations.forEach(d => {
      if (d.city) set.add(d.city);
    });
    return Array.from(set);
  }, [donations]);

  // Filter active (non-expired, non-unavailable) listings per requirement
  const activeDonations = useMemo(() => {
    return filterActiveFeed(donations, false);
  }, [donations]);

  // Apply search, category and city filters
  const filteredDonations = useMemo(() => {
    return activeDonations.filter(donation => {
      // City filter
      if (cityFilter && cityFilter !== 'all') {
        if (donation.city.toLowerCase() !== cityFilter.toLowerCase()) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (donation.category !== categoryFilter) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = donation.foodName.toLowerCase().includes(query);
        const matchesDesc = (donation.description || '').toLowerCase().includes(query);
        const matchesLocation = donation.pickupAddress.toLowerCase().includes(query) || (donation.landmark || '').toLowerCase().includes(query);
        const matchesCity = donation.city.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesLocation && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [activeDonations, cityFilter, categoryFilter, searchTerm]);

  const handleClaimClick = (donation: FoodDonation) => {
    if (!isAuthenticated) {
      // Scenario A: Visitor clicks Claim Food -> redirect to Register with claim context
      navigate('/register', {
        state: {
          returnUrl: '/',
          claimDonationId: donation.id
        }
      });
    } else {
      // Logged in -> open claim modal directly
      onInitiateClaim(donation);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCityFilter(user?.city || 'all');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-emerald-900">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('home.heroTitle')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Fresh Surplus Food, <span className="text-emerald-400">Zero Waste</span>.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            {t('home.heroSubtitle')}
          </p>

          {/* Quick city pill */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t('home.registeredCityBadge')}</span>
              <strong className="text-emerald-300 ml-1">
                {cityFilter === 'all' ? t('home.allCities') : cityFilter}
              </strong>
            </div>

            {!isAuthenticated && (
              <span className="text-[11px] text-emerald-200/80">
                • Public browse mode. Sign in when you wish to claim food.
              </span>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </section>

      {/* Search & Filter Bar */}
      <section>
        <FoodFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          cityFilter={cityFilter}
          onCityChange={setCityFilter}
          availableCities={availableCities}
          registeredCity={user?.city}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* Available Food Listings Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {t('home.availableCount')} ({filteredDonations.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/map')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View on Map</span>
          </button>
        </div>

        {filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <FoodCard
                key={donation.id}
                donation={donation}
                onViewDetails={onViewDetails}
                onClaim={handleClaimClick}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-stone-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-slate-400 mx-auto flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-base">
                {t('home.noFoodFound')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('home.noFoodSub')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              {t('home.clearFilters')}
            </button>
          </div>
        )}
      </section>

      {/* Bottom CTA for Food Donors */}
      <section className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            For Donors & Caterers
          </span>
          <h3 className="text-xl font-extrabold text-amber-950">
            {t('home.donateBannerTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-amber-900/80 max-w-xl">
            {t('home.donateBannerSub')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              navigate('/upload');
            } else {
              navigate('/register', { state: { returnUrl: '/upload' } });
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>{t('home.donateBannerBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
