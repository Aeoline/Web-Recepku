// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDA36DbgOGISLJj9LkUCWUd3iHTszUlpk",
  authDomain: "db-recepku.firebaseapp.com",
  projectId: "db-recepku",
  storageBucket: "db-recepku.appspot.com",
  messagingSenderId: "1095735901778",
  appId: "1:1095735901778:web:dfe03c1c6274a1cd23a98b",
  measurementId: "G-4ZVF18NMLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};