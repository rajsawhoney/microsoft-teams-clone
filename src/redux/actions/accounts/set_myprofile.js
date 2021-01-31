import { SET_MYPROFILE } from "./types";
import { db } from "../../../firebase";

export const set_myprofile = (uid) => (dispatch) => {
  db.collection("user_profiles")
    .doc(uid)
    .get()
    .then((res) => {
      if (res.exists) {
        console.log("User profole:", res.data());
        dispatch({
          type: SET_MYPROFILE,
          payload: res.data(),
        });
      } else {
        console.log("No profile found for this user!");
      }
    })
    .catch((err) => console.log("Something went wrong!", err.message));
};
