
import React from 'react';
import { View, Text, Button } from 'react-native';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome!</Text>
      <Button title="My Profile" onPress={() => router.push('/profile')} />
      <Button title="Swipe" onPress={() => router.push('/swipe')} />
      <Button title="Matches" onPress={() => router.push('/matches')} />
      <Button title="Logout" onPress={() => auth.signOut()} />
    </View>
  );
}
