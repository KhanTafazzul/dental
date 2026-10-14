/**
 * @file lib/firebase.ts
 * @description Firebase Authentication client configuration.
 *
 * Config values are sourced from `@/config/env` with graceful fallback for client initialization.
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { ENV } from '@/config/env'

const isConfigured = Boolean(ENV.FIREBASE_API_KEY && !ENV.FIREBASE_API_KEY.includes('placeholder'))

const firebaseConfig = {
  apiKey: isConfigured ? ENV.FIREBASE_API_KEY : 'AIzaSyDummyKeyForBuildPrerender123456789',
  authDomain: ENV.FIREBASE_AUTH_DOMAIN || 'falix-cde0c.firebaseapp.com',
  projectId: ENV.FIREBASE_PROJECT_ID || 'falix-cde0c',
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET || 'falix-cde0c.firebasestorage.app',
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID || '1063248423040',
  appId: ENV.FIREBASE_APP_ID || '1:1063248423040:web:80d426c16f6551e902de65',
  measurementId: ENV.FIREBASE_MEASUREMENT_ID || 'G-8945NCMBQB',
}

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('[Firebase] Notice: NEXT_PUBLIC_FIREBASE_API_KEY is not configured.')
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function loginWithEmail(email: string, pass: string) {
  if (!isConfigured) {
    return { user: null, error: 'Firebase authentication is not configured. Missing API key.' }
  }
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass)
    return { user: res.user, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Authentication failed' }
  }
}

export async function registerWithEmail(email: string, pass: string) {
  if (!isConfigured) {
    return { user: null, error: 'Firebase authentication is not configured. Missing API key.' }
  }
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass)
    return { user: res.user, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Account registration failed' }
  }
}

export async function loginWithGoogle() {
  if (!isConfigured) {
    return { user: null, error: 'Firebase authentication is not configured. Missing API key.' }
  }
  try {
    const res = await signInWithPopup(auth, googleProvider)
    return { user: res.user, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Google sign-in failed' }
  }
}

export async function logoutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true, message: 'Password reset link sent to your email.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export default app
