import { SET_LAST_MESSAGE } from "./types";

export const set_last_message = (message, uid) => (dispatch) => {
  dispatch({
    type: SET_LAST_MESSAGE,
    payload: { message, uid },
  });
};
