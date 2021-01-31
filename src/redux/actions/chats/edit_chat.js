import { EDIT_CHAT } from "./types";
export const edit_chat = (id, updated_chat) => (dispatch) => {
  dispatch({
    type: EDIT_CHAT,
    payload: { id: id, message: updated_chat },
  });
};
