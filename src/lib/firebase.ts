import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAAOJ1YbjOch-FAo1RErijGLSUOqIkkogE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "falix-cde0c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "falix-cde0c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "falix-cde0c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1063248423040",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1063248423040:web:80d426c16f6551e902de65",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8945NCMBQB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Authentication failed' };
  }
}

export async function registerWithEmail(email: string, pass: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Account registration failed' };
  }
}

export async function loginWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Google sign-in failed' };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset link sent to your email.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export default app;
