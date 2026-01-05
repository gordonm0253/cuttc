import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    
    return { token, user };
  } catch (err) {
    const code = err.code;
    const message = err.message;
    const email = err.customData.email;

    console.log(
      `An error ${code} occurred when logging user with email: ${email} with message: ${message}`,
    );
    return null;
  }
};

export const signOut = async () => {
  await auth.signOut();
};