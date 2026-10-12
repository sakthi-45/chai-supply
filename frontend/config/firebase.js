// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFYWO2PukiHbrBnQySRC47mDFeWVHdEdg",
  authDomain: "chai-supply-c437d.firebaseapp.com",
  projectId: "chai-supply-c437d",
  storageBucket: "chai-supply-c437d.firebasestorage.app",
  messagingSenderId: "77513029521",
  appId: "1:77513029521:web:382746f02bd2d8e1ef0c30",
  measurementId: "G-HCS7723XN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);

export {auth};
