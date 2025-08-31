
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export default function SwipeScreen() {
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter out the current user from the list of users
      setUsers(usersList.filter(user => user.id !== auth.currentUser.uid));
    };
    fetchUsers();
  }, []);

  const handleLike = async () => {
    const likedUserId = users[currentUserIndex].id;
    const db = getFirestore();
    try {
      await addDoc(collection(db, 'likes'), {
        liker: auth.currentUser.uid,
        liked: likedUserId,
      });
      console.log('Liked user:', likedUserId);
      goToNextUser();
    } catch (error) {
        console.error("Error liking user: ", error);
    }
  };

  const goToNextUser = () => {
    setCurrentUserIndex(currentUserIndex + 1);
  };

  if (users.length === 0 || currentUserIndex >= users.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No more users to show.</Text>
      </View>
    );
  }

  const currentUser = users[currentUserIndex];

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{currentUser.id}</Text> 
      <Button title="Like" onPress={handleLike} />
      <Button title="Dislike" onPress={goToNextUser} />
    </View>
  );
}
