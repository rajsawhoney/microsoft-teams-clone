const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

admin.initializeApp();

const app = express();
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
app.get("/helloWorld", (request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


// exports.fetchChats = functions.https.onRequest((req, res) => {
//   const userId = req.params.userId;
//   const userId2 = req.params.userId2;
//   if (userId && userId2) {
//     db.collection("chats")
//       .where("members", "in", [
//         [userId, userId2],
//         [userId2, userId],
//       ])
//       .onSnapshot(function (querySnapshot) {
//         const doc = querySnapshot.docs[0];
//         if (doc) {
//           set_last_message(doc.data().lastMessage, params.userId);
//           return res.json([...doc.data().messages]);
//         } else {
//           return res
//             .status(404)
//             .json({ message: "Not doc found for these users" });
//         }
//       });
//   }
// });

exports.api = functions.https.onRequest(app);
