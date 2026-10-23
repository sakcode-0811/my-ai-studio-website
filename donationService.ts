import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import {
  FoodDonation,
  DonationFormData,
  DonationStatus,
  FoodClaim,
  AppNotification,
  FoodFeedback,
  FoodCategory
} from '../types/donation.ts';
import { evaluateFoodSafety } from './safetyService.ts';

const DONATIONS_COLLECTION = 'donations';
const CLAIMS_COLLECTION = 'claims';
const NOTIFICATIONS_COLLECTION = 'notifications';
const FEEDBACK_COLLECTION = 'feedback';

const LOCAL_STORAGE_DONATIONS_KEY = 'annapurna_food_donations_cache_v3';
const LOCAL_STORAGE_CLAIMS_KEY = 'annapurna_food_claims_cache_v3';
const LOCAL_STORAGE_NOTIFS_KEY = 'annapurna_food_notifications_cache_v3';
const LOCAL_STORAGE_FEEDBACK_KEY = 'annapurna_food_feedback_cache_v3';

// Generate realistic seed dates relative to now
const nowMs = Date.now();
const dateStr = (offsetHours: number) => new Date(nowMs + offsetHours * 3600000).toISOString().slice(0, 10);
const timeStr = (offsetHours: number) => new Date(nowMs + offsetHours * 3600000).toTimeString().slice(0, 5);
const isoStr = (offsetHours: number) => new Date(nowMs + offsetHours * 3600000).toISOString();

const SEED_DONATIONS: FoodDonation[] = [
  {
    id: 'seed-veg-biryani-01',
    foodName: 'Royal Hyderabadi Veg Biryani',
    servings: 25,
    remainingServings: 25,
    prepDate: dateStr(-1.5),
    prepTime: timeStr(-1.5),
    prepTimestamp: isoStr(-1.5),
    expiryDate: dateStr(4.5),
    expiryTime: timeStr(4.5),
    expiryTimestamp: isoStr(4.5),
    pickupDeadline: isoStr(3.0),
    pickupAddress: '42 Orchid Heights, Central Avenue, Baner',
    city: 'Pune',
    landmark: 'Behind Westend Mall, Gate 3',
    latitude: 18.5596,
    longitude: 73.7797,
    description: 'Surplus corporate banquet biryani with long grain basmati rice, tender paneer cubes, saffron, beans, and whole spices.',
    ingredients: 'Basmati rice, paneer, carrots, green peas, ghee, whole cardamom, saffron',
    allergens: 'Contains dairy (paneer & ghee). No nuts.',
    packagingType: 'sealed_containers',
    storageCondition: 'heated_insulated',
    dietaryTags: ['Vegetarian', 'Jain Option Available', 'Nut-Free'],
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    contactName: 'Chef Rajesh Sharma (Hotel Orchid)',
    contactPhone: '+91 98230 45678',
    contactAltPhone: 'Security Desk: Ext 104',
    donorId: 'donor-orchid-baner',
    donorName: 'Chef Rajesh Sharma',
    donorEmail: 'catering@hotelorchidbaner.com',
    status: 'available',
    safetyRating: 'fresh',
    safetyNotes: 'Maintained in thermal hot holding carrier. Prime freshness.',
    createdAt: isoStr(-1.5),
    updatedAt: isoStr(-1.5)
  },
  {
    id: 'seed-chapati-curry-02',
    foodName: 'Fresh Wheat Chapatis & Mix Veg Curry',
    servings: 40,
    remainingServings: 40,
    prepDate: dateStr(-2),
    prepTime: timeStr(-2),
    prepTimestamp: isoStr(-2),
    expiryDate: dateStr(4),
    expiryTime: timeStr(4),
    expiryTimestamp: isoStr(4),
    pickupDeadline: isoStr(2.5),
    pickupAddress: 'Shivaji Nagar Community Hall, FC Road',
    city: 'Pune',
    landmark: 'Opposite Modern College Gate',
    latitude: 18.5284,
    longitude: 73.8441,
    description: 'Fresh homemade whole wheat chapatis (80 pcs) along with rich mixed vegetable gravy in hygienic stackable meal boxes.',
    ingredients: 'Whole wheat flour, cauliflower, green peas, potatoes, tomatoes, cumin, turmeric',
    allergens: 'Wheat/Gluten. Dairy-free & 100% Vegan.',
    packagingType: 'boxed_meals',
    storageCondition: 'room_temperature',
    dietaryTags: ['Vegetarian', 'Low Oil', 'Vegan'],
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    contactName: 'Mrs. Sunita Deshmukh',
    contactPhone: '+91 94220 12345',
    contactAltPhone: '+91 98810 54321',
    donorId: 'donor-sunita-fc',
    donorName: 'Mrs. Sunita Deshmukh',
    donorEmail: 'sunita.d@gmail.com',
    status: 'available',
    safetyRating: 'fresh',
    safetyNotes: 'Prepared 2 hours ago, kept in covered thermal containers.',
    createdAt: isoStr(-2),
    updatedAt: isoStr(-2)
  },
  {
    id: 'seed-chicken-biryani-03',
    foodName: 'Dum Chicken Biryani & Mint Raita',
    servings: 30,
    remainingServings: 30,
    prepDate: dateStr(-1),
    prepTime: timeStr(-1),
    prepTimestamp: isoStr(-1),
    expiryDate: dateStr(20),
    expiryTime: timeStr(20),
    expiryTimestamp: isoStr(20),
    pickupDeadline: isoStr(5),
    pickupAddress: 'Tandoor Grill Kitchen, North Main Road, Koregaon Park',
    city: 'Pune',
    landmark: 'Near Lane 5 corner',
    latitude: 18.5362,
    longitude: 73.8940,
    description: 'Surplus wedding event catering. Halal certified chicken dum biryani with portioned mint raita. Chilled in walk-in cooler.',
    ingredients: 'Chicken, basmati rice, yogurt, mint, fried onions, whole spices',
    allergens: 'Dairy (yogurt/raita). Meat (Chicken).',
    packagingType: 'sealed_containers',
    storageCondition: 'refrigerated',
    dietaryTags: ['Non-Vegetarian', 'Halal', 'High Protein'],
    category: 'non-vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    contactName: 'Tariq Khan (Manager)',
    contactPhone: '+91 97654 32109',
    donorId: 'donor-tandoor-kp',
    donorName: 'Tariq Khan',
    donorEmail: 'manager@tandoorgrill.in',
    status: 'available',
    safetyRating: 'fresh',
    safetyNotes: 'Refrigerated immediately after cooking (< 4°C).',
    createdAt: isoStr(-1),
    updatedAt: isoStr(-1)
  },
  {
    id: 'seed-sandwiches-04',
    foodName: 'Grilled Vegetable & Cheese Sandwiches',
    servings: 20,
    remainingServings: 20,
    prepDate: dateStr(-0.8),
    prepTime: timeStr(-0.8),
    prepTimestamp: isoStr(-0.8),
    expiryDate: dateStr(3.2),
    expiryTime: timeStr(3.2),
    expiryTimestamp: isoStr(3.2),
    pickupDeadline: isoStr(2.5),
    pickupAddress: 'Tech Mahindra Campus, Phase 3, Hinjawadi',
    city: 'Pune',
    landmark: 'Main Reception / Cafeteria Exit',
    latitude: 18.5913,
    longitude: 73.7389,
    description: 'Individually wrapped triangular grilled vegetable sandwiches with cheese and herbs. Surplus from company hackathon.',
    ingredients: 'Brown bread, butter, cheese, capsicum, cucumber, tomato, mint chutney',
    allergens: 'Dairy (cheese/butter), Gluten (bread).',
    packagingType: 'foil_wrapped',
    storageCondition: 'room_temperature',
    dietaryTags: ['Vegetarian', 'Individual Pack'],
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    contactName: 'Rohit Kulkarni (Event Lead)',
    contactPhone: '+91 99221 88776',
    donorId: 'donor-rohit-hinj',
    donorName: 'Rohit Kulkarni',
    donorEmail: 'rohit.k@techm.com',
    status: 'available',
    safetyRating: 'fresh',
    safetyNotes: 'Freshly made under an hour ago. Crisp and clean.',
    createdAt: isoStr(-0.8),
    updatedAt: isoStr(-0.8)
  },
  {
    id: 'seed-steamed-rice-05',
    foodName: 'Steamed Rice & Yellow Tadka Dal',
    servings: 35,
    remainingServings: 0,
    prepDate: dateStr(-3),
    prepTime: timeStr(-3),
    prepTimestamp: isoStr(-3),
    expiryDate: dateStr(2),
    expiryTime: timeStr(2),
    expiryTimestamp: isoStr(2),
    pickupDeadline: isoStr(1),
    pickupAddress: 'Anna Daan Kendra, Narayan Peth',
    city: 'Pune',
    landmark: 'Near Kesari Wada',
    latitude: 18.5173,
    longitude: 73.8507,
    description: 'Hot steamed Kolam rice and yellow toor dal tadka with cumin, turmeric, and fresh cilantro.',
    ingredients: 'Kolam rice, toor dal, ghee, cumin, turmeric, mustard seeds, cilantro',
    allergens: 'Dairy (ghee). Gluten-Free.',
    packagingType: 'casserole_carrier',
    storageCondition: 'room_temperature',
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'High Protein'],
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    contactName: 'Ganesh Shinde',
    contactPhone: '+91 98900 11223',
    donorId: 'donor-ganesh-narayan',
    donorName: 'Ganesh Shinde',
    donorEmail: 'ganesh.s@annadaan.org',
    status: 'claimed',
    verificationToken: 'TK-7842',
    safetyRating: 'warning',
    safetyNotes: 'Prepared 3 hours ago. Claimed by shelter van.',
    createdAt: isoStr(-3),
    updatedAt: isoStr(-0.5)
  }
];

const SEED_CLAIMS: FoodClaim[] = [
  {
    id: 'claim-seed-01',
    donationId: 'seed-steamed-rice-05',
    foodName: 'Steamed Rice & Yellow Tadka Dal',
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    donorId: 'donor-ganesh-narayan',
    donorName: 'Ganesh Shinde',
    donorPhone: '+91 98900 11223',
    recipientId: 'recipient-rahul',
    recipientName: 'Rahul Patil',
    recipientPhone: '+91 98810 55443',
    recipientOrg: 'Asha Shelter NGO',
    claimedServings: 35,
    verificationToken: 'TK-7842',
    tokenVerified: false,
    status: 'pending_pickup',
    pickupAddress: 'Anna Daan Kendra, Narayan Peth',
    city: 'Pune',
    landmark: 'Near Kesari Wada',
    latitude: 18.5173,
    longitude: 73.8507,
    pickupDeadline: isoStr(1),
    expiryTimestamp: isoStr(2),
    claimedAt: isoStr(-0.5),
    hasRecipientFeedback: false,
    hasDonorFeedback: false
  }
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-seed-01',
    userId: 'donor-ganesh-narayan',
    role: 'donor',
    title: 'Your Food Has Been Claimed!',
    message: 'Your food donation, Steamed Rice & Yellow Tadka Dal, has been claimed by Rahul Patil. Servings: 35. Please check your dashboard for the pickup details and verification process.',
    foodName: 'Steamed Rice & Yellow Tadka Dal',
    claimId: 'claim-seed-01',
    donationId: 'seed-steamed-rice-05',
    recipientName: 'Rahul Patil',
    recipientPhone: '+91 98810 55443',
    claimedServings: 35,
    remainingServings: 0,
    pickupAddress: 'Anna Daan Kendra, Narayan Peth, Pune',
    pickupDeadline: isoStr(1),
    expiryTimestamp: isoStr(2),
    verificationToken: 'TK-7842',
    isRead: false,
    createdAt: isoStr(-0.5)
  },
  {
    id: 'notif-seed-02',
    userId: 'recipient-rahul',
    role: 'recipient',
    title: 'Claim Confirmed — Pickup Token Ready',
    message: 'You have claimed 35 servings of Steamed Rice & Yellow Tadka Dal. Present your verification token TK-7842 to the donor during pickup.',
    foodName: 'Steamed Rice & Yellow Tadka Dal',
    claimId: 'claim-seed-01',
    donationId: 'seed-steamed-rice-05',
    donorName: 'Ganesh Shinde',
    claimedServings: 35,
    remainingServings: 0,
    pickupAddress: 'Anna Daan Kendra, Narayan Peth, Pune',
    pickupDeadline: isoStr(1),
    expiryTimestamp: isoStr(2),
    verificationToken: 'TK-7842',
    isRead: false,
    createdAt: isoStr(-0.5)
  }
];

// Helper functions for localStorage caching
function getLocalCache<T>(key: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn(`Failed reading ${key}:`, err);
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
}

function saveLocalCache<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed saving ${key}:`, err);
  }
}

/**
 * Fetch all donations and compute real-time safety & expiration status
 */
export async function getAllDonations(): Promise<FoodDonation[]> {
  try {
    const colRef = collection(db, DONATIONS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: FoodDonation[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<FoodDonation, 'id'>)
      }));
      const merged = mergeDonationSeeds(items);
      saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, merged);
      return updateLiveSafetyStatus(merged);
    }
  } catch (err) {
    // Offline or fallback
  }

  const cached = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  return updateLiveSafetyStatus(cached);
}

function mergeDonationSeeds(items: FoodDonation[]): FoodDonation[] {
  const existingIds = new Set(items.map(i => i.id));
  const missingSeeds = SEED_DONATIONS.filter(s => !existingIds.has(s.id));
  return [...items, ...missingSeeds];
}

/**
 * Evaluates real-time freshness, deadline, and food expiry date/time
 */
export function updateLiveSafetyStatus(donations: FoodDonation[]): FoodDonation[] {
  return donations.map(d => {
    const safety = evaluateFoodSafety(
      d.category,
      d.storageCondition,
      d.prepDate,
      d.prepTime,
      d.pickupDeadline,
      d.expiryTimestamp
    );

    let status = d.status;

    // Automatically mark food as expired when its expiry time or deadline passes
    if (d.status === 'available' && (safety.isExpiredByExpiryTime || safety.isExpiredByDeadline || safety.isExpiredByPrepTime)) {
      status = 'expired';
    }

    return {
      ...d,
      status,
      safetyRating: safety.rating,
      safetyNotes: safety.warnings.length > 0 ? safety.warnings.join(' ') : safety.recommendation,
      hoursElapsedSincePrep: safety.hoursElapsed,
      maxSafeHours: safety.maxSafeHours
    };
  });
}

/**
 * Filter active food listings:
 * "Remove expired food from the active recipient feed."
 */
export function filterActiveFeed(donations: FoodDonation[], showAllHistory: boolean = false): FoodDonation[] {
  const updated = updateLiveSafetyStatus(donations);
  if (showAllHistory) return updated;
  return updated.filter(d => d.status === 'available' && d.remainingServings > 0);
}

/**
 * Create a new food donation with required preparation and expiry timestamps
 */
export async function createDonation(
  formData: DonationFormData,
  user: { uid: string; email?: string | null; displayName?: string | null }
): Promise<FoodDonation> {
  const prepTimestamp = new Date(`${formData.prepDate}T${formData.prepTime}:00`).toISOString();
  const expiryTimestamp = new Date(`${formData.expiryDate}T${formData.expiryTime}:00`).toISOString();
  const deadlineIso = new Date(`${formData.pickupDeadlineDate}T${formData.pickupDeadlineTime}:00`).toISOString();

  const safety = evaluateFoodSafety(
    formData.category,
    formData.storageCondition,
    formData.prepDate,
    formData.prepTime,
    deadlineIso,
    expiryTimestamp
  );

  const id = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const servingsNum = Number(formData.servings);

  const newDonation: FoodDonation = {
    id,
    foodName: formData.foodName.trim(),
    servings: servingsNum,
    remainingServings: servingsNum,
    prepDate: formData.prepDate,
    prepTime: formData.prepTime,
    prepTimestamp,
    expiryDate: formData.expiryDate,
    expiryTime: formData.expiryTime,
    expiryTimestamp,
    pickupDeadline: deadlineIso,
    pickupAddress: formData.pickupAddress.trim(),
    city: formData.city.trim(),
    landmark: formData.landmark.trim() || undefined,
    latitude: formData.latitude,
    longitude: formData.longitude,
    category: formData.category,
    description: formData.description.trim(),
    ingredients: formData.ingredients?.trim() || undefined,
    allergens: formData.allergens?.trim() || undefined,
    packagingType: formData.packagingType,
    storageCondition: formData.storageCondition,
    dietaryTags: formData.dietaryTags,
    imageUrl: formData.imageUrl || getDefaultImageForCategory(formData.category, formData.foodName),
    contactName: formData.contactName.trim(),
    contactPhone: formData.contactPhone.trim(),
    contactAltPhone: formData.contactAltPhone.trim() || undefined,
    donorId: user.uid,
    donorName: user.displayName || formData.contactName.trim(),
    donorEmail: user.email || undefined,
    status: 'available',
    claimCount: 0,
    safetyRating: safety.rating,
    safetyNotes: safety.warnings.length > 0 ? safety.warnings.join(' ') : safety.recommendation,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = doc(db, DONATIONS_COLLECTION, id);
    await setDoc(docRef, newDonation);
  } catch (err) {
    console.warn('Firestore fallback on createDonation:', err);
  }

  const existing = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  const updated = [newDonation, ...existing];
  saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, updated);

  return newDonation;
}

/**
 * Claim food servings, generate a unique verification token, and notify donor immediately
 */
export async function claimDonation(
  donationId: string,
  claimant: {
    userId: string;
    name: string;
    organization?: string;
    phone: string;
    servingsToClaim?: number;
  }
): Promise<{ claim: FoodClaim; updatedDonation: FoodDonation }> {
  const donations = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  const donationIndex = donations.findIndex(d => d.id === donationId);

  if (donationIndex < 0) {
    throw new Error('Food donation not found.');
  }

  const donation = donations[donationIndex];

  // Expiry check
  const now = Date.now();
  if (new Date(donation.expiryTimestamp).getTime() <= now) {
    throw new Error('This food donation has expired and cannot be claimed.');
  }
  if (new Date(donation.pickupDeadline).getTime() <= now) {
    throw new Error('The pickup deadline for this food donation has passed.');
  }
  if (donation.status !== 'available' || donation.remainingServings <= 0) {
    throw new Error('This food donation is no longer available.');
  }

  const servingsToClaim = Math.min(
    donation.remainingServings,
    claimant.servingsToClaim && claimant.servingsToClaim > 0
      ? claimant.servingsToClaim
      : donation.remainingServings
  );

  const newRemainingServings = donation.remainingServings - servingsToClaim;
  const newStatus: DonationStatus = newRemainingServings === 0 ? 'claimed' : 'available';

  // Generate unique 6-character verification token e.g. TK-4921
  const verificationToken = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const claimedAt = new Date().toISOString();

  // Create claim record
  const claim: FoodClaim = {
    id: claimId,
    donationId,
    foodName: donation.foodName,
    category: donation.category,
    imageUrl: donation.imageUrl,
    donorId: donation.donorId,
    donorName: donation.donorName || donation.contactName,
    donorPhone: donation.contactPhone,
    donorEmail: donation.donorEmail,
    recipientId: claimant.userId,
    recipientName: claimant.name,
    recipientPhone: claimant.phone,
    recipientOrg: claimant.organization || 'Community Member',
    claimedServings: servingsToClaim,
    verificationToken,
    tokenVerified: false,
    status: 'pending_pickup',
    pickupAddress: donation.pickupAddress,
    city: donation.city,
    landmark: donation.landmark,
    latitude: donation.latitude,
    longitude: donation.longitude,
    pickupDeadline: donation.pickupDeadline,
    expiryTimestamp: donation.expiryTimestamp,
    claimedAt,
    hasRecipientFeedback: false,
    hasDonorFeedback: false
  };

  // Save claim
  const claims = getLocalCache<FoodClaim>(LOCAL_STORAGE_CLAIMS_KEY, SEED_CLAIMS);
  const updatedClaims = [claim, ...claims];
  saveLocalCache(LOCAL_STORAGE_CLAIMS_KEY, updatedClaims);

  try {
    await setDoc(doc(db, CLAIMS_COLLECTION, claimId), claim);
  } catch (e) {
    // offline fallback
  }

  // Update donation
  const updatedDonation: FoodDonation = {
    ...donation,
    remainingServings: newRemainingServings,
    status: newStatus,
    verificationToken,
    claimCount: (donation.claimCount || 0) + 1,
    updatedAt: claimedAt
  };
  donations[donationIndex] = updatedDonation;
  saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, donations);

  try {
    await updateDoc(doc(db, DONATIONS_COLLECTION, donationId), {
      remainingServings: newRemainingServings,
      status: newStatus,
      updatedAt: claimedAt
    });
  } catch (e) {
    // offline fallback
  }

  // 1. Create immediate DONOR NOTIFICATION
  const donorNotification: AppNotification = {
    id: `notif_${Date.now()}_donor`,
    userId: donation.donorId,
    role: 'donor',
    title: 'Your Food Has Been Claimed!',
    message: `Your food donation, ${donation.foodName}, has been claimed by ${claimant.name}. Servings: ${servingsToClaim}. Please check your dashboard for pickup verification.`,
    foodName: donation.foodName,
    claimId,
    donationId,
    recipientName: claimant.name,
    recipientPhone: claimant.phone,
    claimedServings: servingsToClaim,
    remainingServings: newRemainingServings,
    pickupAddress: `${donation.pickupAddress}, ${donation.city}`,
    pickupDeadline: donation.pickupDeadline,
    expiryTimestamp: donation.expiryTimestamp,
    verificationToken,
    isRead: false,
    createdAt: claimedAt
  };

  // 2. Create RECIPIENT NOTIFICATION
  const recipientNotification: AppNotification = {
    id: `notif_${Date.now()}_recip`,
    userId: claimant.userId,
    role: 'recipient',
    title: 'Claim Confirmed — Pickup Token Ready',
    message: `You successfully claimed ${servingsToClaim} servings of ${donation.foodName}. Present token ${verificationToken} to the donor during pickup.`,
    foodName: donation.foodName,
    claimId,
    donationId,
    donorName: donation.donorName || donation.contactName,
    claimedServings: servingsToClaim,
    remainingServings: newRemainingServings,
    pickupAddress: `${donation.pickupAddress}, ${donation.city}`,
    pickupDeadline: donation.pickupDeadline,
    expiryTimestamp: donation.expiryTimestamp,
    verificationToken,
    isRead: false,
    createdAt: claimedAt
  };

  const notifications = getLocalCache<AppNotification>(LOCAL_STORAGE_NOTIFS_KEY, SEED_NOTIFICATIONS);
  saveLocalCache(LOCAL_STORAGE_NOTIFS_KEY, [donorNotification, recipientNotification, ...notifications]);

  try {
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, donorNotification.id), donorNotification);
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, recipientNotification.id), recipientNotification);
  } catch (e) {
    // fallback
  }

  return { claim, updatedDonation };
}

/**
 * Verify pickup token presented by recipient:
 * Marks claim as 'picked_up' and unlocks feedback for both donor and recipient!
 */
export async function verifyPickupToken(
  tokenOrClaimId: string,
  donorUserId: string
): Promise<{ success: boolean; claim: FoodClaim; message: string }> {
  const cleanInput = tokenOrClaimId.trim().toUpperCase();
  const claims = getLocalCache<FoodClaim>(LOCAL_STORAGE_CLAIMS_KEY, SEED_CLAIMS);

  // Match by token or claim ID
  const claimIndex = claims.findIndex(c =>
    (c.verificationToken.toUpperCase() === cleanInput || c.id === cleanInput) &&
    (c.donorId === donorUserId || !donorUserId) // allow match
  );

  if (claimIndex < 0) {
    throw new Error('Invalid verification token. No pending food claim matches this code.');
  }

  const claim = claims[claimIndex];

  if (claim.tokenVerified || claim.status === 'picked_up') {
    throw new Error(`This token (${claim.verificationToken}) has already been verified and collected.`);
  }

  if (claim.status === 'cancelled') {
    throw new Error('This food claim was cancelled and cannot be verified.');
  }

  const verifiedAt = new Date().toISOString();
  const updatedClaim: FoodClaim = {
    ...claim,
    tokenVerified: true,
    tokenVerifiedAt: verifiedAt,
    status: 'picked_up'
  };

  claims[claimIndex] = updatedClaim;
  saveLocalCache(LOCAL_STORAGE_CLAIMS_KEY, claims);

  try {
    await updateDoc(doc(db, CLAIMS_COLLECTION, claim.id), {
      tokenVerified: true,
      tokenVerifiedAt: verifiedAt,
      status: 'picked_up'
    });
  } catch (e) {
    // fallback
  }

  // Update associated donation status to completed
  const donations = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  const donationIdx = donations.findIndex(d => d.id === claim.donationId);
  if (donationIdx >= 0) {
    donations[donationIdx] = {
      ...donations[donationIdx],
      status: 'completed',
      updatedAt: verifiedAt
    };
    saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, donations);
  }

  // Create Pickup Completed & Feedback Prompt Notifications
  const successNotifDonor: AppNotification = {
    id: `notif_${Date.now()}_verif_donor`,
    userId: claim.donorId,
    role: 'donor',
    title: 'Food Pickup Completed Successfully!',
    message: `Token ${claim.verificationToken} verified! Pickup for ${claim.foodName} has been completed. Please share your feedback to help our community.`,
    foodName: claim.foodName,
    claimId: claim.id,
    donationId: claim.donationId,
    recipientName: claim.recipientName,
    claimedServings: claim.claimedServings,
    remainingServings: 0,
    pickupAddress: claim.pickupAddress,
    pickupDeadline: claim.pickupDeadline,
    expiryTimestamp: claim.expiryTimestamp,
    verificationToken: claim.verificationToken,
    isRead: false,
    createdAt: verifiedAt
  };

  const successNotifRecipient: AppNotification = {
    id: `notif_${Date.now()}_verif_recip`,
    userId: claim.recipientId,
    role: 'recipient',
    title: 'Food Pickup Confirmed!',
    message: `Your pickup for ${claim.foodName} (${claim.claimedServings} servings) was confirmed by the donor. Please share your feedback on the food quality.`,
    foodName: claim.foodName,
    claimId: claim.id,
    donationId: claim.donationId,
    claimedServings: claim.claimedServings,
    remainingServings: 0,
    pickupAddress: claim.pickupAddress,
    pickupDeadline: claim.pickupDeadline,
    expiryTimestamp: claim.expiryTimestamp,
    verificationToken: claim.verificationToken,
    isRead: false,
    createdAt: verifiedAt
  };

  const notifs = getLocalCache<AppNotification>(LOCAL_STORAGE_NOTIFS_KEY, SEED_NOTIFICATIONS);
  saveLocalCache(LOCAL_STORAGE_NOTIFS_KEY, [successNotifDonor, successNotifRecipient, ...notifs]);

  return {
    success: true,
    claim: updatedClaim,
    message: 'Food pickup completed successfully! Please share your feedback to help improve our food-sharing community.'
  };
}

/**
 * Submit feedback for a completed pickup claim
 */
export async function submitFoodFeedback(
  feedbackInput: Omit<FoodFeedback, 'id' | 'createdAt'>
): Promise<FoodFeedback> {
  const claims = getLocalCache<FoodClaim>(LOCAL_STORAGE_CLAIMS_KEY, SEED_CLAIMS);
  const claimIndex = claims.findIndex(c => c.id === feedbackInput.claimId);

  if (claimIndex < 0) {
    throw new Error('Associated food claim not found.');
  }

  const claim = claims[claimIndex];

  // Feedback must become available ONLY after the food pickup has been successfully completed
  if (claim.status !== 'picked_up' || !claim.tokenVerified) {
    throw new Error('Feedback can only be submitted after pickup has been verified and completed.');
  }

  // Prevent duplicate submissions
  if (feedbackInput.fromRole === 'recipient' && claim.hasRecipientFeedback) {
    throw new Error('You have already submitted feedback for this pickup claim.');
  }
  if (feedbackInput.fromRole === 'donor' && claim.hasDonorFeedback) {
    throw new Error('You have already submitted feedback for this pickup claim.');
  }

  const id = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newFeedback: FoodFeedback = {
    ...feedbackInput,
    id,
    createdAt: new Date().toISOString()
  };

  // Update claim flags
  if (feedbackInput.fromRole === 'recipient') {
    claims[claimIndex].hasRecipientFeedback = true;
  } else {
    claims[claimIndex].hasDonorFeedback = true;
  }
  saveLocalCache(LOCAL_STORAGE_CLAIMS_KEY, claims);

  // Save feedback record
  const allFeedback = getLocalCache<FoodFeedback>(LOCAL_STORAGE_FEEDBACK_KEY, []);
  saveLocalCache(LOCAL_STORAGE_FEEDBACK_KEY, [newFeedback, ...allFeedback]);

  try {
    await setDoc(doc(db, FEEDBACK_COLLECTION, id), newFeedback);
    await updateDoc(doc(db, CLAIMS_COLLECTION, claim.id), {
      hasRecipientFeedback: claims[claimIndex].hasRecipientFeedback,
      hasDonorFeedback: claims[claimIndex].hasDonorFeedback
    });
  } catch (e) {
    // fallback
  }

  return newFeedback;
}

/**
 * Fetch all claims
 */
export function getAllClaims(): FoodClaim[] {
  return getLocalCache<FoodClaim>(LOCAL_STORAGE_CLAIMS_KEY, SEED_CLAIMS);
}

/**
 * Fetch claims for a specific user (either as donor or recipient)
 */
export function getClaimsForUser(userId: string, role?: 'donor' | 'recipient'): FoodClaim[] {
  const claims = getAllClaims();
  if (role === 'donor') {
    return claims.filter(c => c.donorId === userId || !userId);
  }
  if (role === 'recipient') {
    return claims.filter(c => c.recipientId === userId || !userId);
  }
  return claims.filter(c => c.donorId === userId || c.recipientId === userId || !userId);
}

/**
 * Fetch notifications for user
 */
export function getNotificationsForUser(userId: string): AppNotification[] {
  const notifs = getLocalCache<AppNotification>(LOCAL_STORAGE_NOTIFS_KEY, SEED_NOTIFICATIONS);
  return notifs.filter(n => n.userId === userId || !userId || n.userId.includes('donor') || n.userId.includes('recip'));
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const notifs = getLocalCache<AppNotification>(LOCAL_STORAGE_NOTIFS_KEY, SEED_NOTIFICATIONS);
  const idx = notifs.findIndex(n => n.id === notificationId);
  if (idx >= 0) {
    notifs[idx].isRead = true;
    saveLocalCache(LOCAL_STORAGE_NOTIFS_KEY, notifs);
  }
}

/**
 * Mark all notifications as read for user
 */
export function markAllNotificationsAsRead(userId: string): void {
  const notifs = getLocalCache<AppNotification>(LOCAL_STORAGE_NOTIFS_KEY, SEED_NOTIFICATIONS);
  const updated = notifs.map(n => ({ ...n, isRead: true }));
  saveLocalCache(LOCAL_STORAGE_NOTIFS_KEY, updated);
}

/**
 * Fetch feedback history
 */
export function getAllFeedback(): FoodFeedback[] {
  return getLocalCache<FoodFeedback>(LOCAL_STORAGE_FEEDBACK_KEY, []);
}

export function updateDonationStatus(donationId: string, newStatus: DonationStatus): void {
  const donations = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  const idx = donations.findIndex(d => d.id === donationId);
  if (idx >= 0) {
    donations[idx].status = newStatus;
    donations[idx].updatedAt = new Date().toISOString();
    saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, donations);
  }
}

export function deleteDonation(donationId: string): void {
  const donations = getLocalCache<FoodDonation>(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS);
  const updated = donations.filter(d => d.id !== donationId);
  saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, updated);
}

export function subscribeToDonations(callback: (items: FoodDonation[]) => void): () => void {
  try {
    const colRef = collection(db, DONATIONS_COLLECTION);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: FoodDonation[] = snapshot.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<FoodDonation, 'id'>)
          }));
          const merged = mergeDonationSeeds(items);
          saveLocalCache(LOCAL_STORAGE_DONATIONS_KEY, merged);
          callback(updateLiveSafetyStatus(merged));
        } else {
          callback(updateLiveSafetyStatus(getLocalCache(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS)));
        }
      },
      () => {
        callback(updateLiveSafetyStatus(getLocalCache(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS)));
      }
    );
    return unsub;
  } catch (e) {
    callback(updateLiveSafetyStatus(getLocalCache(LOCAL_STORAGE_DONATIONS_KEY, SEED_DONATIONS)));
    return () => {};
  }
}

export function getDefaultImageForCategory(category: string, foodName: string): string {
  const lower = foodName.toLowerCase();
  if (lower.includes('biryani') || lower.includes('rice')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('chapati') || lower.includes('roti') || lower.includes('curry')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
  }
  if (lower.includes('sandwich') || lower.includes('burger') || lower.includes('snack')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80';
  }
  if (category === 'non-vegetarian') {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
}
