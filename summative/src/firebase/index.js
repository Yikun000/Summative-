// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5R0wADpip5WcnDkUalSZg3blYgO0KHg4",
  authDomain: "ics4u-c0a34.firebaseapp.com",
  projectId: "ics4u-c0a34",
  storageBucket: "ics4u-c0a34.firebasestorage.app",
  messagingSenderId: "666093513831",
  appId: "1:666093513831:web:73a506690c7159da95f8c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

enableIndexedDbPersistence(firestore)
    .catch((error) => {
        if (error.code === 'failed-precondition') {
            console.error("Firestore persistence failed: Multiple tabs open");
        } else if (error.code === 'unimplemented') {
            console.error("Firestore persistence is not supported by this browser");
        } else {
            console.error("Error enabling Firestore persistence:", error);
        }
    });

export { app, auth, firestore, googleProvider };