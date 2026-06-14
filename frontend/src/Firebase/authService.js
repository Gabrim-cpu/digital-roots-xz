import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

export const registerUser = async ({
  email,
  password,
  name,
  role,
  age,
  language,
  interests
}) => {

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const uid = credential.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    role,
    age,
    language,
    interests,
    createdAt: serverTimestamp()
  });

  return uid;
};

export const loginUser = async (
  email,
  password
) => {

  const credential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  const uid = credential.user.uid;

  const snapshot =
    await getDoc(doc(db, "users", uid));

  return snapshot.data();
};