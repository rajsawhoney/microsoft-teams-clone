import { FETCH_CHATS } from "./types";
export const fetch_chats = (chats) => (dispatch) => {
      dispatch({
        type: FETCH_CHATS,
        payload: chats,
      });
};
