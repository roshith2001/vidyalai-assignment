// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "vidyalai-whiteboard.firebaseapp.com",
  projectId: "vidyalai-whiteboard",
  storageBucket: "vidyalai-whiteboard.appspot.com",
  messagingSenderId: "312138349434",
  appId: "1:312138349434:web:be2c6ae226d1d383f534c3",
  databaseURL: "https://vidyalai-whiteboard-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
