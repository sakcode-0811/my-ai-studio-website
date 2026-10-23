import React, { useState } from 'react';
import {
  X,
  Star,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { FoodClaim, FoodFeedback } from '../types/donation.ts';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: FoodClaim | null;
  currentUserRole: 'donor' | 'recipient';
  currentUserId: string;
  currentUserName: string;
  onSubmitFeedback: (feedback: Omit<FoodFeedback, 'id' | 'createdAt'>) => Promise<void>;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  claim,
  currentUserRole,
  currentUserId,
  currentUserName,
  onSubmitFeedback
}) => {
  if (!isOpen || !claim) return null;

  // Star Rating component
  const StarPicker = ({
    value,
    onChange,
    label
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="font-semibold text-slate-700">{label}:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300 hover:text-amber-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const [overallRating, setOverallRating] = useState(5);
  // Recipient fields
  const [qualityRating, setQualityRating] = useState(5);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [donorCommRating, setDonorCommRating] = useState(5);
  const [issueCategory, setIssueCategory] = useState('none');
  // Donor fields
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [recipientCommRating, setRecipientCommRating] = useState(5);

  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.tokenVerified || claim.status !== 'picked_up') {
      setError('Feedback can only be submitted after pickup token has been verified.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData: Omit<FoodFeedback, 'id' | 'createdAt'> = {
        claimId: claim.id,
        donationId: claim.donationId,
        foodName: claim.foodName,
        fromUserId: currentUserId || 'guest_user',
        fromUserName: currentUserName || (currentUserRole === 'donor' ? claim.donorName : claim.recipientName),
        fromRole: currentUserRole,
        toUserId: currentUserRole === 'donor' ? claim.recipientId : claim.donorId,
        overallRating,
        ...(currentUserRole === 'recipient'
          ? {
              qualityRating,
              accuracyRating,
              donorCommunicationRating: donorCommRating,
              issueCategory: issueCategory !== 'none' ? issueCategory : undefined
            }
          : {
              punctualityRating,
              recipientCommunicationRating: recipientCommRating
            }),
        comments: comments.trim() || undefined
      };

      await onSubmitFeedback(feedbackData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base font-bold">
              {currentUserRole === 'recipient' ? 'Rate Food & Pickup Experience' : 'Rate Recipient Handover'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Claim Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
            <img
              src={claim.imageUrl}
              alt={claim.foodName}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Verified Completed Pickup
              </span>
              <h3 className="font-bold text-slate-900 text-sm truncate">{claim.foodName}</h3>
              <p className="text-slate-500">
                {currentUserRole === 'recipient'
                  ? `Provided by Donor: ${claim.donorName}`
                  : `Collected by Recipient: ${claim.recipientName} (${claim.recipientOrg})`}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Ratings list */}
          <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200 divide-y divide-slate-100">
            <StarPicker
              value={overallRating}
              onChange={setOverallRating}
              label="Overall Experience Rating"
            />

            {currentUserRole === 'recipient' ? (
              <>
                <StarPicker
                  value={qualityRating}
                  onChange={setQualityRating}
                  label="Food Quality & Freshness"
                />
                <StarPicker
                  value={accuracyRating}
                  onChange={setAccuracyRating}
                  label="Accuracy of Description"
                />
                <StarPicker
                  value={donorCommRating}
                  onChange={setDonorCommRating}
                  label="Donor Communication"
                />
              </>
            ) : (
              <>
                <StarPicker
                  value={punctualityRating}
                  onChange={setPunctualityRating}
                  label="Pickup Punctuality"
                />
                <StarPicker
                  value={recipientCommRating}
                  onChange={setRecipientCommRating}
                  label="Recipient Coordination"
                />
              </>
            )}
          </div>

          {/* Recipient Issue Category (Optional) */}
          {currentUserRole === 'recipient' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Issue / Feedback Category:
              </label>
              <select
                value={issueCategory}
                onChange={e => setIssueCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-emerald-500"
              >
                <option value="none">Everything was great (No issues)</option>
                <option value="packaging_issue">Packaging could be improved</option>
                <option value="portion_discrepancy">Portion differed from listing</option>
                <option value="location_hard_to_find">Pickup location difficult to navigate</option>
                <option value="temperature_warm">Temperature holding needed ice/warm box</option>
              </select>
            </div>
          )}

          {/* Written comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments & Recommendations (Optional):
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Share details about the food condition, packaging, hygiene, or gratitude..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Reviews are public to promote food safety and community accountability without exposing personal phone numbers.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
