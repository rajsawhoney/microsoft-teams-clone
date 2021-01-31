import { RETREIVE_PROFILES } from "./types";
import { auth, db } from "../../../firebase";

export const retrieve_profiles = () => (dispatch) => {
  var user = auth.currentUser;
  var uid = "";
  if (user != null) {
    uid = user.uid;
  }
  db.collection("user_profiles")
    .onSnapshot(function (querySnapshot) {
      let user_profiles = [];
      querySnapshot.forEach(function (doc) {
        user_profiles.push(doc.data());
      });
      const partner_profiles = user_profiles.filter(   //fetch partner profiles only i.e. except current user
        (user) => user.userId !== uid
      );
      dispatch({
        type: RETREIVE_PROFILES,
        payload: partner_profiles,
      });
    });
};
