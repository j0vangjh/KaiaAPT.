import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEpcKVl_Omqz4ijNccaIhPe7K8VEiFd9M",
  authDomain: "kaiaapt.firebaseapp.com",
  projectId: "kaiaapt",
  storageBucket: "kaiaapt.firebasestorage.app",
  messagingSenderId: "765136557292",
  appId: "1:765136557292:web:86635e1d785a137a0d41c9",
};

firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ experimentalForceLongPolling: true });

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();
