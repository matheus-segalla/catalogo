import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlR8lBm7JyjIdFOHxsG3Lzwpy3hNhAEyw",
  authDomain: "catalogo-c85bf.firebaseapp.com",
  projectId: "catalogo-c85bf",
  storageBucket: "catalogo-c85bf.firebasestorage.app",
  messagingSenderId: "10151503292",
  appId: "1:10151503292:web:4bf7b4ea470146d16377b9",
  measurementId: "G-GF794H0VNN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
