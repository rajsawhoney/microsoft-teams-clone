import { auth } from "../../../firebase";
import { AUTH_STATUS } from "./types";
import { toast } from "react-toastify";

export const signup = (username, password) => (dispatch) => {
  auth
    .createUserWithEmailAndPassword(username, password)
    .then((res) => {
      console.log("User registered!!!", res.user);
      dispatch({
        type: AUTH_STATUS,
        payload: { user: res.user, status: true },
      });
    })
    .catch((err) => {
      toast.error(`😞😥 Failed!!! ${err.message}`);
    });

  return true;
};
