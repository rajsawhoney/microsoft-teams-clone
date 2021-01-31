import { auth } from "../../../firebase";
import { LOGOUT } from "./types";

export const logout = () => (dispatch) => {
  auth
    .signOut()
    .then(() => {
      dispatch({
        type: LOGOUT,
      });
    })
    .catch((err) => console.log("Failed to logout!!!", err.message));
};
