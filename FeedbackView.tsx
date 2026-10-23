import React from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  User,
  Utensils
} from 'lucide-react';
import { FoodClaim, FoodFeedback } from '../types/donation.ts';
import { formatLocalDateTime } from '../services/safetyService.ts';

interface FeedbackViewProps {
  userRole: 'donor' | 'recipient';
  claims: FoodClaim[];
  feedbacks: FoodFeedback[];
  onOpenFeedbackModal: (claim: FoodClaim) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  userRole,
  claims,
  feedbacks,
  onOpenFeedbackModal
}) => {
  // Claims eligible for feedback (picked_up and verified)
  const completedClaims = claims.filter(c => c.status === 'picked_up' && c.tokenVerified);

  const pendingFeedbackClaims = completedClaims.filter(c => {
    if (userRole === 'donor') return !c.hasDonorFeedback;
    return !c.hasRecipientFeedback;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Community Ratings & Feedback
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Food Pickup Feedback & Quality Assurance
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
          "Food pickup completed successfully! Please share your feedback to help improve our food-sharing community." Feedback is strictly unlocked only after pickup token verification.
        </p>
      </div>

      {/* Section 1: Completed Pickups Awaiting Feedback */}
      {pendingFeedbackClaims.length > 0 && (
        <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              Pickups Awaiting Your Feedback ({pendingFeedbackClaims.length})
            </h3>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-xs text-amber-900/80">
            You recently completed the following verified pickups. Please rate your experience:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingFeedbackClaims.map(claim => (
              <div
                key={claim.id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{claim.foodName}</h4>
                  <p className="text-xs text-slate-500">
                    {userRole === 'donor'
                      ? `Recipient: ${claim.recipientName} (${claim.claimedServings} serv.)`
                      : `Donor: ${claim.donorName} (${claim.claimedServings} serv.)`}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                    Token: {claim.verificationToken} • Verified
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenFeedbackModal(claim)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Leave Feedback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Feedback History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Community Feedback History</h3>
            <p className="text-xs text-slate-500">Verified reviews and quality ratings from completed food handovers.</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {feedbacks.length} Reviews
          </span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700">No reviews submitted yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once a food claim pickup is verified with the token, both donor and recipient can share feedback here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map(f => (
              <div key={f.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      f.fromRole === 'donor'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {f.fromRole === 'donor' ? 'Donor Review' : 'Recipient Review'}
                    </span>
                    <strong className="text-slate-900 text-sm">{f.fromUserName}</strong>
                    <span className="text-xs text-slate-400">• on <strong>{f.foodName}</strong></span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {formatLocalDateTime(f.createdAt)}
                  </span>
                </div>

                {/* Star display */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= f.overallRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-amber-900 ml-1">{f.overallRating}.0</span>
                  </div>

                  {f.qualityRating && (
                    <span className="text-slate-600 text-[11px]">
                      Quality: <strong>{f.qualityRating}/5</strong>
                    </span>
                  )}
                  {f.accuracyRating && (
                    <span className="text-slate-600 text-[11px]">
                      Accuracy: <strong>{f.accuracyRating}/5</strong>
                    </span>
                  )}
                  {f.punctualityRating && (
                    <span className="text-slate-600 text-[11px]">
                      Punctuality: <strong>{f.punctualityRating}/5</strong>
                    </span>
                  )}
                  {f.issueCategory && f.issueCategory !== 'none' && (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200 font-medium">
                      Note: {f.issueCategory.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {f.comments && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                    "{f.comments}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
