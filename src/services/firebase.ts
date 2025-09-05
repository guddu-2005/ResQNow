
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  projectId: 'rescueai-h6774',
  appId: '1:24120687339:web:45fa7145236954c9cf9cae',
  storageBucket: 'rescueai-h6774.firebasestorage.app',
  apiKey: 'AIzaSyDVGvtbJSzd7OPxjI_LOwNCdeUV8h_LcE0',
  authDomain: 'rescueai-h6774.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '24120687339',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};
