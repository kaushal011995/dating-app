
import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig is in the root
import LoginScreen from './login';
import HomeScreen from './home'; // We will create this

export default function Index() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return user ? <HomeScreen /> : <LoginScreen />;
}
