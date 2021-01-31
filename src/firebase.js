import firebase from "firebase";
const fireConf = {
  apiKey: "AIzaSyA7hYLksdoJLij6TbOicwOr6LVAOqJNv1A",
  authDomain: "share-message-85a43.firebaseapp.com",
  databaseURL: "https://share-message-85a43.firebaseio.com",
  projectId: "share-message-85a43",
  storageBucket: "share-message-85a43.appspot.com",
  messagingSenderId: "895841365577",
  appId: "1:895841365577:web:f2b41086d4134536169998",
  measurementId: "G-S7VG4NS8L9",
};

firebase.initializeApp(fireConf);
export const auth = firebase.auth();
export const db = firebase.firestore();
export const firedb = firebase.database();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

firebase
  .firestore()
  .enablePersistence() //this is done for the firebase offline data caching
  .catch(function (err) {
    if (err.code === "failed-precondition") {
      console.log(
        "Multiple tabs open, persistence can only be enabled in one tab at a a time."
      );
    } else if (err.code === "unimplemented") {
      console.log(
        "The current browser does not support all of the features required to enable persistence"
      );
    }
  });
export default firebase;
