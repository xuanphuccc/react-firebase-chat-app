import { initializeApp } from "firebase/app";

// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1q6CnSceA_lpePw1k4yc4vHywd7p2QDQ",
  authDomain: "chataap-34af1.firebaseapp.com",
  databaseURL:
    "https://chataap-34af1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chataap-34af1",
  storageBucket: "chataap-34af1.appspot.com",
  messagingSenderId: "965239617544",
  appId: "1:965239617544:web:895c5a6184da8a0cb4f9bd",
  measurementId: "G-6G3DSF9VJD",
};

const app = initializeApp(firebaseConfig); //OK
// const analytics = getAnalytics(app); // OK

const auth = getAuth(app); // OK
const db = getFirestore(app); // OK

// Chuyển sang Firebase emulator trên localhost
// connectAuthEmulator(auth, "http://localhost:9099");
// connectFirestoreEmulator(db, "localhost", 8080);

export { auth, db };
