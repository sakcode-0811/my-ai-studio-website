import React from 'react';
import {
  Clock,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Snowflake,
  HandHeart,
  Lock
} from 'lucide-react';
import { FoodDonation } from '../types/donation.ts';
import { formatLocalDateTime, formatRelativeTime, formatPrepDateTime } from '../services/safetyService.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FoodCardProps {
  donation: FoodDonation;
  onViewDetails: (donation: FoodDonation) => void;
  onClaim?: (donation: FoodDonation) => void;
  isOwner?: boolean;
  isAuthenticated?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  onViewDetails,
  onClaim,
  isOwner = false,
  isAuthenticated = true
}) => {
  const { t } = useLanguage();

  const isVeg = donation.category === 'vegetarian';
  const isAvailable = donation.status === 'available';
  const isClaimed = donation.status === 'claimed';
  const isExpired = donation.status === 'expired';

  const prepDisplay = formatPrepDateTime(donation.prepDate, donation.prepTime);
  const deadlineDisplay = formatLocalDateTime(donation.pickupDeadline);
  const expiryDisplay = formatLocalDateTime(donation.expiryTimestamp);
  const relativePrep = formatRelativeTime(donation.prepTimestamp, true);
  const relativeDeadline = formatRelativeTime(donation.pickupDeadline, false);

  const remaining = donation.remainingServings !== undefined ? donation.remainingServings : donation.servings;

  return (
    <div
      className={`group rounded-2xl bg-white border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col ${
        isAvailable
          ? 'border-stone-200 hover:border-emerald-400'
          : isClaimed
          ? 'border-indigo-200 bg-indigo-50/15'
          : 'border-stone-200 opacity-75'
      }`}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={donation.imageUrl}
          alt={donation.foodName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Badge (Veg / Non-Veg) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-white/95 text-slate-800 border border-stone-200/50">
          <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
          <span>{isVeg ? t('upload.categoryVeg') : t('upload.categoryNonVeg')}</span>
        </div>

        {/* Status / Freshness Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {isAvailable ? (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 ${
                donation.safetyRating === 'fresh'
                  ? 'bg-emerald-600 text-white'
                  : donation.safetyRating === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {donation.safetyRating === 'fresh' && <CheckCircle2 className="w-3 h-3" />}
              {donation.safetyRating === 'warning' && <AlertTriangle className="w-3 h-3" />}
              {donation.safetyRating === 'expired' && <ShieldAlert className="w-3 h-3" />}
              {donation.safetyRating === 'fresh'
                ? t('card.freshRating')
                : donation.safetyRating === 'warning'
                ? t('card.warningRating')
                : t('card.criticalRating')}
            </span>
          ) : isClaimed ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-indigo-600 text-white shadow-md">
              {t('card.claimedBadge')}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-slate-600 text-white shadow-md">
              {t('card.expiredBadge')}
            </span>
          )}

          {donation.storageCondition === 'refrigerated' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-100/90 text-sky-800 backdrop-blur-xs flex items-center gap-1">
              <Snowflake className="w-3 h-3" /> Chilled
            </span>
          )}
          {donation.storageCondition === 'heated_insulated' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100/90 text-amber-800 backdrop-blur-xs flex items-center gap-1">
              <Flame className="w-3 h-3" /> Warm Insulated
            </span>
          )}
        </div>

        {/* Servings count overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {remaining} {t('card.servingsLeft')}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {donation.foodName}
            </h3>
          </div>

          {donation.description && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {donation.description}
            </p>
          )}

          {/* Details Grid */}
          <div className="mt-3.5 space-y-2 text-xs border-t border-stone-100 pt-3">
            {/* Prep Date & Time */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {t('card.prepTime')}:
              </span>
              <span className="font-semibold text-slate-800 text-right">
                {prepDisplay} {relativePrep && <span className="text-[11px] font-normal text-slate-500">({relativePrep})</span>}
              </span>
            </div>

            {/* Food Expiry Date and Time */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                {t('card.expiresAt')}:
              </span>
              <span className={`font-bold text-right ${isExpired ? 'text-red-600 line-through' : 'text-amber-800'}`}>
                {expiryDisplay}
              </span>
            </div>

            {/* Pickup Deadline */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {t('card.pickupDeadline')}:
              </span>
              <span className={`font-semibold text-right ${isExpired ? 'text-red-600 line-through' : 'text-red-700'}`}>
                {deadlineDisplay} {relativeDeadline && !isExpired && <span className="text-[11px] font-normal text-red-600">({relativeDeadline})</span>}
              </span>
            </div>

            {/* Pickup Location */}
            <div className="flex items-start justify-between text-slate-600 gap-2">
              <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                City & Area:
              </span>
              <span className="font-semibold text-slate-800 text-right truncate">
                {donation.city} • {donation.landmark || donation.pickupAddress.split(',')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Safety note banner snippet */}
        {donation.safetyNotes && (
          <div className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-50 text-slate-600 border border-stone-200/80 line-clamp-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">{donation.safetyNotes}</span>
          </div>
        )}

        {/* Card Actions */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(donation)}
            className="text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:underline flex items-center gap-1 py-1.5 px-1 cursor-pointer"
          >
            <span>{t('card.detailsBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {isAvailable && onClaim && (
            <button
              type="button"
              onClick={() => onClaim(donation)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <HandHeart className="w-3.5 h-3.5" />
              <span>{t('card.claimFoodBtn')}</span>
            </button>
          )}

          {isClaimed && (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              Pickup Pending
            </span>
          )}

          {isExpired && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {t('card.expiredBadge')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
