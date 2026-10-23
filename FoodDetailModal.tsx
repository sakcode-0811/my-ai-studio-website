import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Package,
  Snowflake,
  Flame,
  HandHeart,
  Share2,
  Navigation,
  MessageSquare
} from 'lucide-react';
import { FoodDonation } from '../types/donation.ts';
import { formatLocalDateTime, formatPrepDateTime, formatRelativeTime } from '../services/safetyService.ts';
import { PickupDisplayMap } from './PickupDisplayMap.tsx';

interface FoodDetailModalProps {
  donation: FoodDonation | null;
  onClose: () => void;
  onClaim?: (donation: FoodDonation) => void;
  isRecipient?: boolean;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  donation,
  onClose,
  onClaim,
  isRecipient = true
}) => {
  if (!donation) return null;

  const isVeg = donation.category === 'vegetarian';
  const isAvailable = donation.status === 'available';
  const isClaimed = donation.status === 'claimed';
  const isExpired = donation.status === 'expired';

  const prepDisplay = formatPrepDateTime(donation.prepDate, donation.prepTime);
  const deadlineDisplay = formatLocalDateTime(donation.pickupDeadline);
  const relativePrep = formatRelativeTime(donation.prepTimestamp, true);
  const relativeDeadline = formatRelativeTime(donation.pickupDeadline, false);

  const cleanPhone = donation.contactPhone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
              {isVeg ? 'Vegetarian Food' : 'Non-Vegetarian Food'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner Image with Servings and Status */}
          <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
            <img
              src={donation.imageUrl}
              alt={donation.foodName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow">
                  <Users className="w-3.5 h-3.5" />
                  {donation.servings} Servings Available
                </span>
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow ${
                  donation.safetyRating === 'fresh' ? 'bg-emerald-500 text-white' :
                  donation.safetyRating === 'warning' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  Freshness: {donation.safetyRating}
                </span>
                {donation.storageCondition === 'refrigerated' && (
                  <span className="bg-sky-500/90 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Snowflake className="w-3 h-3" /> Refrigerated
                  </span>
                )}
                {donation.storageCondition === 'heated_insulated' && (
                  <span className="bg-amber-600/90 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Heated Insulated
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow">
                {donation.foodName}
              </h1>
            </div>
          </div>

          {/* Time & Preparation Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Prep Date & Time */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs uppercase font-bold text-slate-500 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Preparation Time
              </span>
              <div className="text-sm sm:text-base font-bold text-slate-800">
                {prepDisplay}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cooked {relativePrep || 'recently'}
              </p>
            </div>

            {/* Food Expiry Date & Time */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300">
              <span className="text-xs uppercase font-bold text-amber-800 block mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Food Expiry Time
              </span>
              <div className={`text-sm sm:text-base font-bold ${isExpired ? 'text-red-600 line-through' : 'text-amber-950'}`}>
                {formatLocalDateTime(donation.expiryTimestamp)}
              </div>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                {isExpired ? 'Expired — not safe' : `Expires ${formatRelativeTime(donation.expiryTimestamp, false)}`}
              </p>
            </div>

            {/* Pickup Deadline */}
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
              <span className="text-xs uppercase font-bold text-red-600 block mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                Pickup Deadline
              </span>
              <div className={`text-sm sm:text-base font-bold ${isExpired ? 'text-red-600 line-through' : 'text-red-900'}`}>
                {deadlineDisplay}
              </div>
              <p className="text-xs text-red-700 mt-1 font-medium">
                {isExpired ? 'Deadline expired' : `Collect within ${relativeDeadline}`}
              </p>
            </div>
          </div>

          {/* Safety Evaluation Callout */}
          <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
            donation.safetyRating === 'fresh' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
            donation.safetyRating === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-950' :
            'bg-red-50 border-red-300 text-red-950'
          }`}>
            {donation.safetyRating === 'fresh' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {donation.safetyRating === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {donation.safetyRating === 'expired' && <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}

            <div>
              <div className="font-bold mb-0.5">Food Safety Assessment</div>
              <p className="text-slate-700 leading-relaxed">{donation.safetyNotes}</p>
            </div>
          </div>

          {/* Food Details, Ingredients, Allergens & Packaging */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Description, Ingredients & Packaging
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
              {donation.description || 'Fresh surplus food in clean, hygienic containers.'}
            </p>

            {(donation.ingredients || donation.allergens) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                {donation.ingredients && (
                  <div>
                    <strong className="text-slate-800 block mb-0.5">Key Ingredients:</strong>
                    <span className="text-slate-600">{donation.ingredients}</span>
                  </div>
                )}
                {donation.allergens && (
                  <div>
                    <strong className="text-amber-800 block mb-0.5">Allergen Information:</strong>
                    <span className="text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded font-medium inline-block">
                      {donation.allergens}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                Packaging: <strong className="capitalize">{donation.packagingType.replace(/_/g, ' ')}</strong>
              </span>
              {donation.dietaryTags?.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pickup Location & Interactive Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Pickup Location & Interactive Map
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {donation.latitude.toFixed(5)}, {donation.longitude.toFixed(5)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
              <div>
                <strong>Address:</strong> {donation.pickupAddress}, {donation.city}
              </div>
              {donation.landmark && (
                <div className="text-slate-600 text-xs">
                  <strong>Landmark / Directions:</strong> {donation.landmark}
                </div>
              )}
            </div>

            {/* Embedded Leaflet Map with actual saved coordinates */}
            <PickupDisplayMap donation={donation} height="260px" />
          </div>

          {/* Contact Details Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              Donor Contact & Coordination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Contact Person</span>
                <span className="font-bold text-white text-base">{donation.contactName}</span>
                {donation.donorEmail && (
                  <span className="text-slate-400 text-xs block">{donation.donorEmail}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Phone Number</span>
                <span className="font-bold text-emerald-300 text-base">{donation.contactPhone}</span>
                {donation.contactAltPhone && (
                  <span className="text-slate-400 text-xs block">Alt: {donation.contactAltPhone}</span>
                )}
              </div>
            </div>

            {/* Action buttons to call or message */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Donor
              </a>
              <a
                href={`sms:${cleanPhone}?body=Hello, regarding your food donation "${donation.foodName}" on Annapurna platform`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send SMS
              </a>
              <a
                href={`https://wa.me/${cleanPhone.replace('+', '')}?text=Hi, regarding your surplus food donation: ${encodeURIComponent(donation.foodName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-semibold rounded-lg transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {isAvailable ? 'Listing is active and ready for pickup claim' :
             isClaimed ? 'Claimed by recipient (pickup in progress)' :
             'Listing has expired or completed'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>

            {isAvailable && onClaim && (
              <button
                type="button"
                onClick={() => onClaim(donation)}
                className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-md transition-all"
              >
                <HandHeart className="w-4 h-4" />
                Claim This Food
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
