import { initializeApp } from "firebase/app";

// import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export { auth, db, storage };
