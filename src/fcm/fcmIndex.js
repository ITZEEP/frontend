import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyCoYr1H2VwJaLpHA0krtZCOX-dTDGlXZYM',
  authDomain: 'itzeep-de0ca.firebaseapp.com',
  projectId: 'itzeep-de0ca',
  storageBucket: 'itzeep-de0ca.firebasestorage.app',
  messagingSenderId: '966020195845',
  appId: '1:966020195845:web:9532cf29ef4f7108d55e6c',
  measurementId: 'G-4MWDC6FYCE',
}

const app = initializeApp(firebaseConfig)

export const messaging = getMessaging(app)

export default app
