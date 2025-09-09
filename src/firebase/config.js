import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDrjZNkw7GXjnNSBczq1Z0aFC_EzsY8jWU",
  authDomain: "domionz.firebaseapp.com",
  databaseURL: "https://domionz-default-rtdb.firebaseio.com",
  projectId: "domionz",
  storageBucket: "domionz.firebasestorage.app",
  messagingSenderId: "69669184487",
  appId: "1:69669184487:web:e93cf03a2364043db69342",
  measurementId: "G-61JBCLQ912"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
