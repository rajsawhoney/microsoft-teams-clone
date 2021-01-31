import { auth } from "../../../firebase";
import { LOGIN, AUTH_STATUS } from "./types";
import { toast } from "react-toastify";

export const login = (username, password) => (dispatch) => {
  auth.signInWithEmailAndPassword(username, password).catch((err) => {
    console.log(err.message);
    toast.error(`😞😥 Failed!!! \n ${err.message}`);
  });

  auth.onAuthStateChanged(function (user) {
    //or use firebase.auth().currentUser;
    if (user) {
      // User is signed in.
      dispatch({
        type: LOGIN,
        payload: user,
      });
      window.location.href = "/";
    } else {
      // No user is signed in.
      dispatch({
        type: AUTH_STATUS,
        payload: { user: null, status: false },
      });
    }
  });

  return true;
};
