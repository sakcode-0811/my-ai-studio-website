export type FoodCategory = 'vegetarian' | 'non-vegetarian';

export type StorageCondition = 'room_temperature' | 'refrigerated' | 'heated_insulated';

export type PackagingType =
  | 'sealed_containers'
  | 'boxed_meals'
  | 'foil_wrapped'
  | 'casserole_carrier'
  | 'biodegradable_pack'
  | 'loose_catering_pans';

export type DonationStatus = 'available' | 'claimed' | 'completed' | 'expired' | 'cancelled';

export type ClaimStatus = 'pending_pickup' | 'picked_up' | 'cancelled';

export type SafetyRating = 'fresh' | 'warning' | 'critical' | 'expired';

export type UserActivityMode = 'choice' | 'donor' | 'recipient';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  organization?: string;
}

export interface FoodDonation {
  id: string;
  // 1. Food Name
  foodName: string;
  // 2. Food Servings (positive whole number)
  servings: number;
  remainingServings: number;
  // 3. Date of Food Preparation (YYYY-MM-DD)
  prepDate: string;
  // 4. Time of Food Preparation (HH:mm)
  prepTime: string;
  prepTimestamp: string;
  // 6 & 7. Food Expiry Date and Time (Required)
  expiryDate: string;
  expiryTime: string;
  expiryTimestamp: string;
  // 10. Pickup Deadline (must be after prep time, and cannot be later than expiry time)
  pickupDeadline: string;
  // 5. Pickup Location
  pickupAddress: string;
  city: string;
  landmark?: string;
  // 6. Map Location (Leaflet coordinates)
  latitude: number;
  longitude: number;
  // 7. Food Description, packaging & ingredients
  description: string;
  ingredients?: string;
  allergens?: string;
  packagingType: PackagingType;
  storageCondition: StorageCondition;
  dietaryTags?: string[];
  // 8. Food Category
  category: FoodCategory;
  // 9. Food Image
  imageUrl: string;
  // 11. Contact Details
  contactName: string;
  contactPhone: string;
  contactAltPhone?: string;

  // Metadata & Access Control
  donorId: string;
  donorName?: string;
  donorEmail?: string;
  status: DonationStatus;
  
  // Verification & Claims
  verificationToken?: string; // Token for full pickup
  claimCount?: number;

  // Safety evaluation
  safetyRating: SafetyRating;
  safetyNotes: string;
  hoursElapsedSincePrep?: number;
  maxSafeHours?: number;

  createdAt: string;
  updatedAt: string;
}

export interface FoodClaim {
  id: string;
  donationId: string;
  foodName: string;
  category: FoodCategory;
  imageUrl: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorEmail?: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  recipientOrg?: string;
  claimedServings: number;
  verificationToken: string; // e.g. TK-4921
  tokenVerified: boolean;
  tokenVerifiedAt?: string;
  status: ClaimStatus;
  pickupAddress: string;
  city: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  pickupDeadline: string;
  expiryTimestamp: string;
  claimedAt: string;
  hasRecipientFeedback?: boolean;
  hasDonorFeedback?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string; // The user who should receive this
  role: 'donor' | 'recipient';
  title: string; // e.g. "Your Food Has Been Claimed!"
  message: string;
  foodName: string;
  claimId: string;
  donationId: string;
  recipientName?: string;
  recipientPhone?: string;
  donorName?: string;
  claimedServings: number;
  remainingServings: number;
  pickupAddress: string;
  pickupDeadline: string;
  expiryTimestamp: string;
  verificationToken?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FoodFeedback {
  id: string;
  claimId: string;
  donationId: string;
  foodName: string;
  fromUserId: string;
  fromUserName: string;
  fromRole: 'donor' | 'recipient';
  toUserId: string;
  overallRating: number; // 1 to 5
  // Recipient ratings
  qualityRating?: number; // 1 to 5
  accuracyRating?: number; // 1 to 5
  donorCommunicationRating?: number; // 1 to 5
  issueCategory?: string;
  // Donor ratings
  punctualityRating?: number; // 1 to 5
  recipientCommunicationRating?: number; // 1 to 5
  comments?: string;
  createdAt: string;
}

export interface FoodSafetyRule {
  id: string;
  category: FoodCategory | 'all';
  storageCondition: StorageCondition;
  warningHours: number;
  maxSafeHours: number;
  title: string;
  guidelineDescription: string;
}

export interface SafetyEvaluation {
  rating: SafetyRating;
  hoursElapsed: number;
  hoursRemainingUntilSafetyLimit: number;
  maxSafeHours: number;
  warningHours: number;
  isExpiredByPrepTime: boolean;
  isExpiredByDeadline: boolean;
  isExpiredByExpiryTime: boolean;
  warnings: string[];
  recommendation: string;
}

export interface DonationFormData {
  foodName: string;
  servings: number | '';
  prepDate: string;
  prepTime: string;
  expiryDate: string;
  expiryTime: string;
  pickupDeadlineDate: string;
  pickupDeadlineTime: string;
  pickupAddress: string;
  city: string;
  landmark: string;
  latitude: number;
  longitude: number;
  category: FoodCategory;
  description: string;
  ingredients: string;
  allergens: string;
  packagingType: PackagingType;
  storageCondition: StorageCondition;
  dietaryTags: string[];
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  contactAltPhone: string;
}
