
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function MatchesScreen() {
  const [matches, setMatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      const db = getFirestore();
      const matchesCollection = collection(db, 'matches');
      const q = query(matchesCollection, where('users', 'array-contains', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const matchesList = await Promise.all(querySnapshot.docs.map(async (matchDoc) => {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(uid => uid !== auth.currentUser.uid);
        
        if (otherUserId) {
            const userRef = doc(db, "users", otherUserId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                 return {
                    id: matchDoc.id,
                    otherUser: { id: otherUserId, ...userSnap.data() }
                };
            }
        }
        return null;
      }));
      
      setMatches(matchesList.filter(match => match !== null));
    };

    if (auth.currentUser) {
        fetchMatches();
    }
  }, [auth.currentUser]);

  const handleMatchPress = (matchId) => {
      router.push(`/chat/${matchId}`);
  }

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Your Matches</Text>
        {matches.length > 0 ? (
            <FlatList
                data={matches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleMatchPress(item.id)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                            <Image source={{ uri: item.otherUser.profilePicture }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
                            <Text style={{ fontSize: 18 }}>{item.otherUser.id}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        ) : (
            <Text style={{ textAlign: 'center' }}>No matches yet. Keep swiping!</Text>
        )}
    </View>
  );
}
