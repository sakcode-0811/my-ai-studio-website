/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';

// Pages
import { ClaimFood } from './pages/ClaimFood.tsx';
import { UploadFood } from './pages/UploadFood.tsx';
import { Register } from './pages/Register.tsx';
import { Login } from './pages/Login.tsx';
import { Profile } from './pages/Profile.tsx';
import { NotFound } from './pages/NotFound.tsx';

// Components & Modals
import { InteractiveMapFeed } from './components/InteractiveMapFeed.tsx';
import { FoodDetailModal } from './components/FoodDetailModal.tsx';
import { RecipientClaimModal } from './components/RecipientClaimModal.tsx';
import { TokenVerificationModal } from './components/TokenVerificationModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { SafetyRulesModal } from './components/SafetyRulesModal.tsx';
import { ApiExplorerModal } from './components/ApiExplorerModal.tsx';

// Types & Services
import { FoodDonation, DonationFormData, FoodClaim, AppNotification, FoodFeedback } from './types/donation.ts';
import {
  getAllDonations,
  createDonation,
  claimDonation,
  subscribeToDonations,
  updateLiveSafetyStatus,
  getAllClaims,
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  verifyPickupToken,
  getAllFeedback,
  submitFoodFeedback
} from './services/donationService.ts';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const { currentPath, locationState, navigate } = useNavigation();

  // Core Data States
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [claims, setClaims] = useState<FoodClaim[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [feedbacks, setFeedbacks] = useState<FoodFeedback[]>([]);

  // Modals state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const [selectedFeedbackClaim, setSelectedFeedbackClaim] = useState<FoodClaim | null>(null);
  const [selectedDetailDonation, setSelectedDetailDonation] = useState<FoodDonation | null>(null);
  const [selectedClaimDonation, setSelectedClaimDonation] = useState<FoodDonation | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial data load & real-time subscription
  useEffect(() => {
    getAllDonations().then(data => {
      setDonations(data);
    });

    setClaims(getAllClaims());
    setFeedbacks(getAllFeedback());
    setNotifications(getNotificationsForUser(user?.id || 'donor-orchid-baner'));

    const unsub = subscribeToDonations((items) => {
      setDonations(items);
    });

    return () => unsub();
  }, [user]);

  // Periodic safety refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setDonations(prev => updateLiveSafetyStatus(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if returning from authentication with an intended claim
  useEffect(() => {
    if (isAuthenticated && locationState?.claimDonationId && (currentPath === '/' || currentPath === '/claim')) {
      const match = donations.find(d => d.id === locationState.claimDonationId);
      if (match && match.status === 'available') {
        setSelectedClaimDonation(match);
      }
    }
  }, [isAuthenticated, locationState, donations, currentPath]);

  // Handler: Create Donation
  const handleCreateDonation = async (formData: DonationFormData) => {
    const donorUser = {
      uid: user?.id || 'donor-orchid-baner',
      email: user?.email || 'donor@annapurna.org',
      displayName: user?.name || formData.contactName
    };

    const created = await createDonation(formData, donorUser);
    setDonations(prev => updateLiveSafetyStatus([created, ...prev.filter(d => d.id !== created.id)]));
    showToast(`Food donation "${created.foodName}" (${created.servings} servings) successfully published!`);
  };

  // Handler: Confirm Claim
  const handleConfirmClaim = async (
    donationId: string,
    claimant: { name: string; phone: string; organization?: string; servingsToClaim?: number; notes?: string }
  ) => {
    const result = await claimDonation(donationId, {
      userId: user?.id || 'recipient-asha-pune',
      name: claimant.name,
      organization: claimant.organization,
      phone: claimant.phone,
      servingsToClaim: claimant.servingsToClaim
    });

    setDonations(prev => prev.map(d => (d.id === donationId ? result.updatedDonation : d)));
    setClaims(prev => [result.claim, ...prev]);
    setNotifications(getNotificationsForUser(user?.id || 'donor-orchid-baner'));

    showToast(`Claim confirmed! Pickup code is ${result.claim.verificationToken}. Donor notified immediately.`);
    return result;
  };

  // Handler: Verify Token
  const handleVerifyToken = async (token: string) => {
    const result = await verifyPickupToken(token, user?.id || '');
    setClaims(getAllClaims());
    setDonations(prev => prev.map(d => (d.id === result.claim.donationId ? { ...d, status: 'completed' } : d)));
    setNotifications(getNotificationsForUser(user?.id || 'donor-orchid-baner'));
    showToast(result.message);
    return result;
  };

  // Handler: Submit Feedback
  const handleSubmitFeedback = async (feedbackData: Omit<FoodFeedback, 'id' | 'createdAt'>) => {
    const createdFeedback = await submitFoodFeedback(feedbackData);
    setFeedbacks(prev => [createdFeedback, ...prev]);
    setClaims(getAllClaims());
    showToast('Food pickup feedback submitted successfully. Thank you for strengthening community trust!');
  };

  const handleOpenFeedbackModal = (claim: FoodClaim) => {
    setSelectedFeedbackClaim(claim);
    setIsFeedbackModalOpen(true);
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotificationsForUser(user?.id || 'donor-orchid-baner'));
  };

  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsAsRead(user?.id || 'donor-orchid-baner');
    setNotifications(getNotificationsForUser(user?.id || 'donor-orchid-baner'));
    showToast('All notifications marked as read.');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const pendingPickupClaims = claims.filter(c => c.status === 'pending_pickup');

  // Route Rendering
  const renderCurrentRoute = () => {
    if (currentPath === '/' || currentPath === '/claim') {
      return (
        <ClaimFood
          donations={donations}
          onViewDetails={(donation) => setSelectedDetailDonation(donation)}
          onInitiateClaim={(donation) => {
            if (!isAuthenticated) {
              // Scenario A: Visitor clicks Claim Food -> redirect to register with return context
              navigate('/register', {
                state: {
                  returnUrl: '/',
                  claimDonationId: donation.id
                }
              });
            } else {
              setSelectedClaimDonation(donation);
            }
          }}
        />
      );
    }

    if (currentPath === '/upload') {
      return <UploadFood onCreateDonation={handleCreateDonation} />;
    }

    if (currentPath === '/register') {
      return <Register />;
    }

    if (currentPath === '/login') {
      return <Login />;
    }

    if (currentPath === '/profile') {
      return (
        <Profile
          donations={donations}
          claims={claims}
          feedbacks={feedbacks}
          onOpenVerifyTokenModal={() => setIsTokenModalOpen(true)}
          onOpenFeedbackModal={handleOpenFeedbackModal}
          onViewDonationDetails={(donation) => setSelectedDetailDonation(donation)}
        />
      );
    }

    if (currentPath === '/map') {
      return (
        <div className="space-y-4">
          <InteractiveMapFeed
            donations={donations}
            onSelectDonation={(donation) => setSelectedDetailDonation(donation)}
            onClaimDonation={(donation) => {
              if (!isAuthenticated) {
                navigate('/register', {
                  state: {
                    returnUrl: '/map',
                    claimDonationId: donation.id
                  }
                });
              } else {
                setSelectedClaimDonation(donation);
              }
            }}
          />
        </div>
      );
    }

    return <NotFound />;
  };

  return (
    <MainLayout
      unreadNotificationsCount={unreadNotificationsCount}
      onOpenNotifications={() => setIsNotificationsModalOpen(true)}
      onOpenVerifyTokenModal={() => setIsTokenModalOpen(true)}
      onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
      onOpenApiModal={() => setIsApiModalOpen(true)}
      toastMessage={toastMessage}
    >
      {renderCurrentRoute()}

      {/* Full Food Details Modal */}
      <FoodDetailModal
        donation={selectedDetailDonation}
        onClose={() => setSelectedDetailDonation(null)}
        onClaim={(donation) => {
          setSelectedDetailDonation(null);
          if (!isAuthenticated) {
            navigate('/register', {
              state: {
                returnUrl: '/',
                claimDonationId: donation.id
              }
            });
          } else {
            setSelectedClaimDonation(donation);
          }
        }}
      />

      {/* Recipient Claim Modal */}
      <RecipientClaimModal
        donation={selectedClaimDonation}
        isOpen={!!selectedClaimDonation}
        onClose={() => setSelectedClaimDonation(null)}
        onConfirmClaim={handleConfirmClaim}
        defaultName={user?.name || undefined}
      />

      {/* Pickup Token Verification Modal */}
      <TokenVerificationModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        pendingClaims={pendingPickupClaims}
        onVerifyToken={handleVerifyToken}
        onOpenFeedback={handleOpenFeedbackModal}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onOpenTokenVerification={(token) => {
          setIsNotificationsModalOpen(false);
          setIsTokenModalOpen(true);
        }}
      />

      {/* Pickup Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedFeedbackClaim(null);
        }}
        claim={selectedFeedbackClaim}
        currentUserRole={user?.role === 'donor' ? 'donor' : 'recipient'}
        currentUserId={user?.id || 'user-default'}
        currentUserName={user?.name || 'Rahul Patil'}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* Configurable Safety Rules Modal */}
      <SafetyRulesModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onRulesUpdated={() => {
          setDonations(prev => updateLiveSafetyStatus(prev));
          showToast('Food safety thresholds updated and recalculated across all active listings.');
        }}
      />

      {/* Backend API Explorer Modal */}
      <ApiExplorerModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        donations={donations}
      />
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
