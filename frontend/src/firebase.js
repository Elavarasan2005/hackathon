import {
  initializeApp
} from "firebase/app";

import {
  getAuth
} from "firebase/auth";

import {
  initializeFirestore
} from "firebase/firestore";


const firebaseConfig = {

  apiKey:
    "AIzaSyCwhA6j_lvJtIn1J2MsAkjSHc_u93L7DO0",

  authDomain:
    "dayflow-hrms-d2025.firebaseapp.com",

  projectId:
    "dayflow-hrms-d2025",

  storageBucket:
    "dayflow-hrms-d2025.firebasestorage.app",

  messagingSenderId:
    "429044182959",

  appId:
    "1:429044182959:web:87415a34b92eb4d8d7095a"

};


const app =
  initializeApp(firebaseConfig);


export const auth =
  getAuth(app);


export const db =
  initializeFirestore(
    app,
    {},
    "default"
  );