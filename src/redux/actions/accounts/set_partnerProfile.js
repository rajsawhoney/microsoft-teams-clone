import { SET_PARTNERPROFILE } from "./types";
import { db } from "../../../firebase";

export const set_partnerProfile = (uid) => (dispatch) => {
  db.collection("user_profiles")
    .doc(uid)
    .get()
    .then((res) => {
      if (res.exists) {
        dispatch({
          type: SET_PARTNERPROFILE,
          payload: res.data(),
        });
      } else {
        console.log("No profile found for this user!");
      }
    })
    .catch((err) => console.log("Something went wrong!", err.message));
};
