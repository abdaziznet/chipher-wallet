
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-9022282456-2408f",
  "appId": "1:85040082909:web:302562292f26acde731034",
  "storageBucket": "studio-9022282456-2408f.firebasestorage.app",
  "apiKey": "AIzaSyDztd8GVVxpneCuk4h4mgaL3LbkfVMCGNE",
  "authDomain": "studio-9022282456-2408f.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "85040082909"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
