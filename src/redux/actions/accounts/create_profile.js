import { db } from "../../../firebase";
import { CREATE_PROFILE } from "./types";
export const create_profile = (userId, displayName, about_me, profile_pic) => (
  dispatch
) => {
  db.collection("user_profiles")
    .doc(userId)
    .get()
    .then((res) => {
      if (!res.exists) {
        db.collection("user_profiles")
      .doc(userId)
      .set({
        displayName: displayName,
        profile_pic: profile_pic,
        about_me: about_me,
        userId: userId,
      })
      .then((res) => {
        dispatch({
          type: CREATE_PROFILE,
          payload: {isOldUser:false},
        });
      })
      .catch((err) =>
        console.log("Failed to create user profile!!!", err.message)
      );
      } else {
        dispatch({
          type: CREATE_PROFILE,
          payload: {isOldUser:true},
        });
      }
    })
    .catch((err) => console.log("Failed to get user data!!", err.message));

};
