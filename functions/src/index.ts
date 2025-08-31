import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const createMatchOnLike = functions.firestore
    .document("/likes/{likeId}")
    .onCreate(async (snapshot, context) => {
        const like = snapshot.data();
        const likerId = like.liker;
        const likedId = like.liked;

        const likedUserRef = db.collection("likes").where("liker", "==", likedId).where("liked", "==", likerId);

        const likedUserSnapshot = await likedUserRef.get();

        if (!likedUserSnapshot.empty) {
            console.log(`Match found between ${likerId} and ${likedId}`)

            const match = {
                users: [likerId, likedId],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            await db.collection("matches").add(match);
        }
    });
