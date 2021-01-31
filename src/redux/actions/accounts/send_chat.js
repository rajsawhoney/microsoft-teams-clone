import { db } from "../../../firebase";
import firebase from "firebase";
import { SEND_CHAT } from "../chats/types";
import { SET_LAST_MESSAGE } from "../accounts/types";

export const send_chat = (currentUserId, receiverId, message) => (dispatch) => {
  const message_to_be_added = {
    id: Math.ceil(Math.random() * 1000000000) + new Date().toISOString(),
    user_id: currentUserId,
    message: message,
    posted_on: new Date(),
  };

  db.collection("chats")
    .where("members", "in", [
      [currentUserId, receiverId],
      [receiverId, currentUserId],
    ])
    .get()
    .then((res) => {
      const chatId = res?.docs[0]?.id;
      if (chatId) {
        return chatId;
      } else {
        //Two new users came to create a channel
        db.collection("chats")
          .add({
            connected_on: new Date(),
            lastMessage: message_to_be_added,
            members: [currentUserId, receiverId],
            messages: [message_to_be_added],
          })
          .then((res) => {
            console.log(
              "New channels created and posted a brand new message there"
            );
            // setLastMessage(message_to_be_added, receiverId);
            dispatch({
              type: SEND_CHAT,
              payload: message_to_be_added,
            });
            dispatch({
              type: SET_LAST_MESSAGE,
              payload: { message:message_to_be_added, uid:receiverId },
            });
            return false;
          })
          .catch((err) => {
            console.log("Failed to create a new Channel due to ", err);
          });
      }
    })
    .then((chatid) => {
      //Append new message to the existing channel
      if (chatid) {
        db.doc(`chats/${chatid}`)
          .update({
            lastMessage: message_to_be_added,
            messages: firebase.firestore.FieldValue.arrayUnion(
              message_to_be_added
            ),
          })
          .then((res) => {
            console.log("New message successfully sent!", res);
            // setLastMessage(message_to_be_added, receiverId);
            dispatch({
              type: SEND_CHAT,
              payload: message_to_be_added,
            });
            dispatch({
              type: SET_LAST_MESSAGE,
              payload: { message:message_to_be_added, uid:receiverId },
            });
          });
      }
    })
    .catch((err) => {
      console.log("Failed due to ", err);
    });
};

const setLastMessage = (message_to_be_added, userid) => {
  db.collection("user_profiles")
    .doc(userid)
    .update({
      last_message: message_to_be_added,
    })
    .then((res) => {
      console.log("Last message appended with the user account!", res);
    })
    .catch((err) => {
      console.log("Failed to append last message sent!!", err.message);
    });
};
