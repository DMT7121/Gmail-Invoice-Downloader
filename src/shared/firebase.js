// ============================================================
// firebase.js — Khởi tạo Firebase SDK
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants.js';

// Khởi tạo Firebase App
const app = initializeApp(FIREBASE_CONFIG);

// Khởi tạo Firestore
export const db = getFirestore(app);

export default app;
