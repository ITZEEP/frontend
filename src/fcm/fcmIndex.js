import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCoYr1H2VwJaLpHA0krtZCOX-dTDGlXZYM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'itzeep-de0ca.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'itzeep-de0ca',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'itzeep-de0ca.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '966020195845',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:966020195845:web:9532cf29ef4f7108d55e6c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-4MWDC6FYCE',
}

const app = initializeApp(firebaseConfig)

export const messaging = getMessaging(app)

export default app
