import React, { useState } from 'react';
import { X, HandHeart, CheckCircle2, ShieldCheck, MapPin, Clock, Users, KeyRound } from 'lucide-react';
import { FoodDonation, FoodClaim } from '../types/donation.ts';
import { formatLocalDateTime } from '../services/safetyService.ts';

interface RecipientClaimModalProps {
  donation: FoodDonation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: (
    donationId: string,
    claimant: { name: string; phone: string; organization?: string; servingsToClaim?: number; notes?: string }
  ) => Promise<{ claim: FoodClaim; updatedDonation: FoodDonation } | void>;
  defaultName?: string;
}

export const RecipientClaimModal: React.FC<RecipientClaimModalProps> = ({
  donation,
  isOpen,
  onClose,
  onConfirmClaim,
  defaultName
}) => {
  if (!isOpen || !donation) return null;

  const maxAvailable = donation.remainingServings !== undefined ? donation.remainingServings : donation.servings;

  const [name, setName] = useState(defaultName || 'Rahul Patil');
  const [phone, setPhone] = useState('+91 98810 55443');
  const [organization, setOrganization] = useState('Asha Shelter NGO');
  const [servingsToClaim, setServingsToClaim] = useState<number>(maxAvailable);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedClaim, setConfirmedClaim] = useState<FoodClaim | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone number are required to coordinate food pickup.');
      return;
    }

    if (servingsToClaim <= 0 || servingsToClaim > maxAvailable) {
      setError(`Please specify between 1 and ${maxAvailable} servings.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onConfirmClaim(donation.id, {
        name: name.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        servingsToClaim
      });
      if (res && res.claim) {
        setConfirmedClaim(res.claim);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to claim food.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedClaim(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-emerald-300" />
            Claim Surplus Food Donation
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedClaim ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Claim Confirmed & Donor Notified
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Your Pickup Verification Token
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Present this token to the donor ({donation.contactName}) upon arrival at pickup:
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl font-mono">
              <span className="text-3xl font-extrabold text-indigo-900 tracking-widest block">
                {confirmedClaim.verificationToken}
              </span>
              <span className="text-[11px] text-indigo-700 font-sans block mt-1">
                Servings Claimed: <strong>{confirmedClaim.claimedServings}</strong> of {donation.foodName}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-700">
              <div><strong>Pickup Address:</strong> {donation.pickupAddress}, {donation.city}</div>
              {donation.landmark && <div><strong>Landmark:</strong> {donation.landmark}</div>}
              <div><strong>Donor Phone:</strong> {donation.contactPhone}</div>
              <div className="text-red-700"><strong>Pickup Deadline:</strong> {formatLocalDateTime(donation.pickupDeadline)}</div>
              <div className="text-amber-800"><strong>Food Expiry:</strong> {formatLocalDateTime(donation.expiryTimestamp)}</div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Done — View in My Claims
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            {/* Food summary card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <img
                src={donation.imageUrl}
                alt={donation.foodName}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{donation.foodName}</h3>
                <p className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {maxAvailable} Servings Available
                </p>
                <p className="text-slate-600 flex items-center gap-1 text-[11px] truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {donation.pickupAddress}, {donation.city}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] pt-0.5">
                  <span className="text-red-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    Deadline: {formatLocalDateTime(donation.pickupDeadline)}
                  </span>
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Expires: {formatLocalDateTime(donation.expiryTimestamp)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Servings to Claim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Number of Servings to Claim <span className="text-red-500">*</span></span>
                  <span className="text-slate-500 font-normal">Max: {maxAvailable}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={servingsToClaim}
                    onChange={e => setServingsToClaim(Math.min(maxAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-28 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none font-bold"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[5, 10, 20, maxAvailable].filter((v, i, a) => v <= maxAvailable && a.indexOf(v) === i).map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setServingsToClaim(qty)}
                        className={`text-xs px-2 py-1 rounded border ${
                          servingsToClaim === qty ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {qty === maxAvailable ? `All (${qty})` : qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient / Volunteer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Volunteer Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98810 00000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Shelter / Community Group
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. Robin Hood Army / Night Shelter / Community Kitchen"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Pickup Commitment:
              </div>
              <p>
                A unique verification token will be generated. Please collect before {formatLocalDateTime(donation.pickupDeadline)} and present your token to the donor.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming Claim...' : 'Confirm Food Claim & Get Token'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
