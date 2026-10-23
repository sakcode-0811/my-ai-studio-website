export type UserRole = 'donor' | 'recipient' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  isVerified?: boolean;
  phonePrivacyEnabled?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  accountType?: UserRole;
}
