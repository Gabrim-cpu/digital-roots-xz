import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signUpUser = async (email, password, fullName, role, languages) => {
  try {
    // 1. Create the user inside Firebase Authentication safety center
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Create a matching user profile document inside Cloud Firestore database
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: fullName,
      email: email,
      role: role, // 'elder' or 'youth'
      languages: languages || ['English', 'French'],
      rootPointsBalance: 0, // Base gamification start state
      createdAt: new Date()
    });

    return { success: true, user };
  } catch (error) {
    console.error("Firebase Auth Error:", error.message);
    return { success: false, error: error.message };
  }
};