export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
}

export interface WaitlistRegistration {
  uid: string;
  fullName: string;
  email: string;
  collegeName: string;
  course: string;
  graduationYear: string;
  joinedAt: Date;
  referralCode?: string;
  referrerUid?: string;
  referralEmail?: string;
  referralEmails?: string[];
  referralsCount?: number;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
