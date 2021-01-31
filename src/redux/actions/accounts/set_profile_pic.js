import { db, auth } from "../../../firebase";
import { SET_PROFILE_PIC } from "./types";

export const set_profile_pic = (picUrl, removePic) => (dispatch) => {
  const user = auth.currentUser;
  let image_to_be_uploaded;
  if (removePic) {
    image_to_be_uploaded = "";
  } else {
    image_to_be_uploaded = picUrl;
  }
  if (user != null && !removePic) {
    db.collection("user_profiles")
      .doc(user?.uid)
      .update({ profile_pic: image_to_be_uploaded })
      .then((res) => {
        dispatch({
          type: SET_PROFILE_PIC,
          payload: {
            isUploaded: true,
            newImageUrl: image_to_be_uploaded,
            message: "Profile Pic successfully updated!!",
          },
        });
      })
      .catch((err) =>
        dispatch({
          type: SET_PROFILE_PIC,
          payload: {
            isUploaded: false,
            message: `Failed to update profile pic due to ${err.message}`,
          },
        })
      );
  } else {
    console.log("Its remove photo call....");
    dispatch({
      type: SET_PROFILE_PIC,
      payload: {
        isUploaded: true,
        message: `Profile Pic Successfully removed!!!`,
      },
    });
  }
};
