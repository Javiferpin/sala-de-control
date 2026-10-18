// Capa de datos con Firebase (solo se carga si config.js tiene datos).
// Estructura en Firestore:  users/{uid}/entries · events · sections · meta/settings
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot,
} from "firebase/firestore";

export function createFirebaseStore(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  let uid = null;
  const col = (name) => collection(db, "users", uid, name);

  return {
    mode: "firebase",
    onUser(cb) {
      return onAuthStateChanged(auth, (u) => {
        uid = u ? u.uid : null;
        cb(u ? { uid: u.uid, name: u.displayName || "", email: u.email || "", photo: u.photoURL || "" } : null);
      });
    },
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
    subscribe(name, cb, onError) {
      return onSnapshot(col(name), (snap) => cb(snap.docs.map((d) => ({ ...d.data(), id: d.id }))), onError);
    },
    subscribeSettings(cb, onError) {
      return onSnapshot(doc(db, "users", uid, "meta", "settings"), (s) => cb(s.exists() ? s.data() : {}), onError);
    },
    add: (name, data) => addDoc(col(name), data),
    update: (name, id, patch) => updateDoc(doc(db, "users", uid, name, id), patch),
    remove: (name, id) => deleteDoc(doc(db, "users", uid, name, id)),
    saveSettings: (patch) => setDoc(doc(db, "users", uid, "meta", "settings"), patch, { merge: true }),
  };
}
