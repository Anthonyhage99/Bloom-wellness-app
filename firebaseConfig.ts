import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0oGLQqt-mXZyvAHig_58DtkBX_JTPzGg",
  authDomain: "bloom-app-a099b.firebaseapp.com",
  projectId: "bloom-app-a099b",
  storageBucket: "bloom-app-a099b.firebasestorage.app",
  messagingSenderId: "4715173580",
  appId: "1:4715173580:web:d2dcc8253ccd2cb8521469",
  measurementId: "G-JR3DYYXNKL",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
