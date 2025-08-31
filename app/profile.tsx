
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
      setUploading(true);
      const response = await fetch(image);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
      
      try {
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        const db = getFirestore();
        await setDoc(doc(db, "users", auth.currentUser.uid), {
            profilePicture: downloadURL
        }, { merge: true });
        alert("Profile picture updated!");
      } catch (e) {
        console.log(e);
        alert("Upload failed, please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <Button title="Upload Image" onPress={uploadImage} disabled={!image || uploading} />
    </View>
  );
}
