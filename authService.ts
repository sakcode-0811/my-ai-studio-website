import { auth, googleAuthProvider, signInWithPopup, fbSignOut, onAuthStateChanged, User } from '../lib/firebase.ts';
import { UserProfile, RegisterData } from '../types/auth.ts';

const SESSION_STORAGE_KEY = 'annapurna_user_session_v3';
const USERS_REGISTRY_KEY = 'annapurna_registered_users_v3';

// Default Demo Users
const DEFAULT_DEMO_USERS: Record<string, UserProfile> = {
  donor: {
    id: 'donor-orchid-baner',
    name: 'Chef Rajesh Sharma',
    email: 'chef.rajesh@orchidhotel.com',
    phone: '+91 98230 45678',
    city: 'Pune',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
    role: 'donor',
    createdAt: '2025-11-10T09:30:00.000Z',
    isVerified: true,
    phonePrivacyEnabled: false
  },
  recipient: {
    id: 'recipient-asha-pune',
    name: 'Rahul Patil',
    email: 'rahul.patil@ashashelter.org',
    phone: '+91 98810 55443',
    city: 'Pune',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'recipient',
    createdAt: '2026-01-15T14:20:00.000Z',
    isVerified: true,
    phonePrivacyEnabled: false
  }
};

function getRegisteredUsers(): Record<string, { profile: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    'chef.rajesh@orchidhotel.com': {
      profile: DEFAULT_DEMO_USERS.donor,
      passwordHash: 'password123'
    },
    'rahul.patil@ashashelter.org': {
      profile: DEFAULT_DEMO_USERS.recipient,
      passwordHash: 'password123'
    }
  };
}

function saveRegisteredUsers(users: Record<string, { profile: UserProfile; passwordHash: string }>) {
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
}

export function getStoredSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading session', e);
  }
  return null;
}

export function saveSession(user: UserProfile) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const users = getRegisteredUsers();
  const lowerEmail = email.toLowerCase().trim();
  const record = users[lowerEmail];

  if (!record) {
    throw new Error('No account found with this email. Please register first.');
  }

  if (record.passwordHash !== password) {
    throw new Error('Incorrect password. Please verify your credentials.');
  }

  saveSession(record.profile);
  return record.profile;
}

export async function registerUser(data: RegisterData): Promise<UserProfile> {
  const users = getRegisteredUsers();
  const lowerEmail = data.email.toLowerCase().trim();

  if (users[lowerEmail]) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const newProfile: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: lowerEmail,
    phone: data.phone.trim(),
    city: data.city.trim() || 'Pune',
    role: data.accountType || 'both',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=16a34a,0d9488`,
    createdAt: new Date().toISOString(),
    isVerified: true,
    phonePrivacyEnabled: false
  };

  users[lowerEmail] = {
    profile: newProfile,
    passwordHash: data.password
  };

  saveRegisteredUsers(users);
  saveSession(newProfile);
  return newProfile;
}

export async function loginDemoUser(role: 'donor' | 'recipient'): Promise<UserProfile> {
  const demoProfile = DEFAULT_DEMO_USERS[role];
  saveSession(demoProfile);
  return demoProfile;
}

export async function loginWithGoogleAuth(): Promise<UserProfile> {
  try {
    const cred = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = cred.user;
    const profile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Google User',
      email: fbUser.email || 'user@example.com',
      phone: fbUser.phoneNumber || '+91 98220 11223',
      city: 'Pune',
      avatarUrl: fbUser.photoURL || undefined,
      role: 'both',
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    saveSession(profile);
    return profile;
  } catch (err: any) {
    // If popup blocked in preview iframe, use demo login fallback
    console.warn('Google sign-in popup fallback:', err.message);
    const fallbackProfile = DEFAULT_DEMO_USERS.recipient;
    saveSession(fallbackProfile);
    return fallbackProfile;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const current = getStoredSession();
  if (!current || current.id !== userId) {
    throw new Error('Not authorized to update this profile.');
  }

  const updated: UserProfile = {
    ...current,
    ...updates
  };

  saveSession(updated);

  // Update in user registry if email exists
  const users = getRegisteredUsers();
  const lowerEmail = updated.email.toLowerCase();
  if (users[lowerEmail]) {
    users[lowerEmail].profile = updated;
    saveRegisteredUsers(users);
  }

  return updated;
}

export async function updateUserPassword(email: string, oldPass: string, newPass: string): Promise<void> {
  const users = getRegisteredUsers();
  const lowerEmail = email.toLowerCase().trim();
  const record = users[lowerEmail];

  if (!record) {
    throw new Error('User record not found.');
  }

  if (record.passwordHash !== oldPass) {
    throw new Error('Current password is incorrect.');
  }

  record.passwordHash = newPass;
  saveRegisteredUsers(users);
}

export async function logoutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    // ignore
  }
  clearSession();
}
