import React, { useState } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  MapPin,
  Sparkles,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { FoodClaim } from '../types/donation.ts';

interface TokenVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingClaims: FoodClaim[];
  onVerifyToken: (token: string) => Promise<{ success: boolean; claim: FoodClaim; message: string }>;
  onOpenFeedback?: (claim: FoodClaim) => void;
}

export const TokenVerificationModal: React.FC<TokenVerificationModalProps> = ({
  isOpen,
  onClose,
  pendingClaims,
  onVerifyToken,
  onOpenFeedback
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedClaim, setVerifiedClaim] = useState<FoodClaim | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter the 6-character pickup verification token.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await onVerifyToken(tokenInput.trim());
      setVerifiedClaim(result.claim);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the token.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectPending = (token: string) => {
    setTokenInput(token);
    setError(null);
  };

  const handleClose = () => {
    setTokenInput('');
    setError(null);
    setVerifiedClaim(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base font-bold">Pickup Token Verification</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Success State */}
          {verifiedClaim ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Token {verifiedClaim.verificationToken} Verified
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Food Pickup Completed Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Handover confirmed for <strong>{verifiedClaim.claimedServings} servings</strong> of{' '}
                  <strong>{verifiedClaim.foodName}</strong> to{' '}
                  <strong>{verifiedClaim.recipientName}</strong> ({verifiedClaim.recipientOrg}).
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Feedback Unlocked!
                </div>
                <p>
                  "Food pickup completed successfully! Please share your feedback to help improve our food-sharing community."
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {onOpenFeedback && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = verifiedClaim;
                      handleClose();
                      onOpenFeedback(c);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Give Donor Feedback
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                When the recipient arrives for pickup, ask for their 6-character verification token (e.g. <strong>TK-7842</strong>) to securely confirm handover.
              </p>

              {/* Token Input Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Enter Recipient's Verification Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={e => {
                        setTokenInput(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      placeholder="e.g. TK-7842"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-2.5 text-base font-mono font-bold tracking-wider rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none uppercase"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || !tokenInput.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying Token in Database...' : 'Verify Token & Confirm Handover'}
                </button>
              </form>

              {/* Pending Claims List for Fast Selection */}
              {pendingClaims.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Your Pending Claims Awaiting Pickup ({pendingClaims.length}):
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pendingClaims.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectPending(c.verificationToken)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          tokenInput === c.verificationToken
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-900 truncate">{c.foodName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Claimed by: <strong className="text-slate-700">{c.recipientName}</strong></span>
                            <span>•</span>
                            <span>{c.claimedServings} Servings</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded text-xs shrink-0">
                          {c.verificationToken}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
