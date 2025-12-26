import React, {createContext, useContext, useState, useEffect} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GoogleAuthProvider} from '@react-native-firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '783043022147-tbq3i25o7itjnso9jn2oqfk39il0hrb6.apps.googleusercontent.com',
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user1 => {
      setUser(user1);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const emailSignIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const emailSignUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };
  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(
        result.data.idToken,
      );
      await auth.signInWithCredential(googleCredential);
    } catch (error) {
      throw error;
    }
  };
  const logout = async () => {
    try {
      await signOut(auth);
      await GoogleSignin.signOut();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailSignIn,
        emailSignUp,
        googleSignIn,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
