import { db } from "../../../firebase";
import { UPDATE_STATUS,UPDATE_DISP_NAME } from "./types";

export const update_profile_status = (name_update, new_data, uid) => (
  dispatch
) => {
  var data_to_be_updated;
  if (name_update) {
    data_to_be_updated = { displayName: new_data };
  } else {
    data_to_be_updated = { about_me: new_data };
  }
  if (new_data && uid) {
    db.collection("user_profiles")
      .doc(uid)
      .update(data_to_be_updated)
      .then(() => {
        if (name_update) {
          dispatch({
            type: UPDATE_DISP_NAME,
            payload: {
              isUpdated: true,
              new_name: new_data,
              message: "Your DisplayName is successfully updated!!!!",
            },
          });
        } else {
          dispatch({
            type: UPDATE_STATUS,
            payload: {
              isUpdated: true,
              new_status: new_data,
              message: "Profile Status Successfully Updated!!!!!",
            },
          });
        }
      })
      .catch((err) => {
        if (name_update) {
          dispatch({
            type: UPDATE_DISP_NAME,
            payload: {
              isUpdated: false,
              message: `Failed to update displayName due to ${err?.message}!!!`,
            },
          });
        } else {
          dispatch({
            type: UPDATE_STATUS,
            payload: {
              isUpdated: false,
              message: `Failed to update status due to ${err?.message}!!!`,
            },
          });
        }
      });
  } else {
    console.log("Some error detected!!!", new_data, uid);
  }
};
