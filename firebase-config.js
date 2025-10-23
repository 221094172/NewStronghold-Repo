import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnAELCOR-iuUxDHTzDIsvH_908H3Ty8_M",
  authDomain: "stronghold-tech-security.firebaseapp.com",
  projectId: "stronghold-tech-security",
  storageBucket: "stronghold-tech-security.firebasestorage.app",
  messagingSenderId: "219762173879",
  appId: "1:219762173879:web:de888e2ad9cf111c296a32",
  measurementId: "G-914DQTT1VX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, addDoc, updateDoc, deleteDoc, doc };