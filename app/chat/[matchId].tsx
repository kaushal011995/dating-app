
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';
import { useLocalSearchParams } from 'expo-router';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const db = getFirestore();

  useEffect(() => {
    if (!matchId) return;

    const messagesCollection = collection(doc(db, 'matches', matchId as string), 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (newMessage.trim() === '' || !matchId) return;

    const messagesCollection = collection(doc(db, 'matches', matchId as string), 'messages');
    await addDoc(messagesCollection, {
      text: newMessage,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser.uid,
    });

    setNewMessage('');
  };

  const renderItem = ({ item }) => (
    <View style={{
        alignSelf: item.senderId === auth.currentUser.uid ? 'flex-end' : 'flex-start',
        backgroundColor: item.senderId === auth.currentUser.uid ? '#DCF8C6' : '#FFF',
        borderRadius: 20,
        marginVertical: 5,
        marginHorizontal: 10,
        padding: 10,
        maxWidth: '80%',
    }}>
        <Text>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
    >
        <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingTop: 10 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' }}>
            <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, padding: 10 }}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
            />
            <Button title="Send" onPress={handleSend} />
        </View>
    </KeyboardAvoidingView>
  );
}
