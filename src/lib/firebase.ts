import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirestoreErrorInfo, OperationType } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Validates if the current origin is part of the authorized domains for 'buoyant-sol-mmvz5'.
 * Logs a detailed diagnostic warning or returns a user-readable instruction if they must authorise it.
 */
export function checkDomainAuthorizationStatus(): { isAuthorized: boolean; warningMessage: string | null } {
  if (typeof window === 'undefined') {
    return { isAuthorized: true, warningMessage: null };
  }
  
  const currentHost = window.location.hostname;
  const projectName = 'buoyant-sol-mmvz5';
  
  // Standard default domains for this firebase project
  const defaultAuthorizedDomains = [
    'localhost',
    '127.0.0.1',
    `${projectName}.firebaseapp.com`,
    `${projectName}.web.app`
  ];

  const isAuthorized = defaultAuthorizedDomains.some(domain => {
    return currentHost === domain || currentHost.endsWith('.' + domain);
  });

  if (!isAuthorized) {
    const errorMsg = `Firebase Auth Domain Check: Current domain '${currentHost}' is not in the default authorized list for project '${projectName}'. To prevent 'auth/unauthorized-domain' crashes, log into Firebase Console -> Authentication -> Settings -> 'Authorized domains' and add '${currentHost}' to the list.`;
    console.warn(errorMsg);
    return {
      isAuthorized: false,
      warningMessage: errorMsg
    };
  }

  return { isAuthorized: true, warningMessage: null };
}

// Perform instant check on load
checkDomainAuthorizationStatus();

/**
 * Enhances standard Auth Error messages into beautiful step-by-step resolution instructions
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  const message = error?.message || '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
  const projectName = 'buoyant-sol-mmvz5';

  if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    return `Firebase Auth: Domain [${currentHost}] is Unauthorized! 
To fix this:
1. Go to Firebase Console for project '${projectName}'
2. Navigate to Build > Authentication
3. Select the 'Settings' tab
4. Click 'Authorized domains' 
5. Add '${currentHost}' to the list and click save!`;
  }
  
  return error.message || 'Failed to authenticate. Please try again.';
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

