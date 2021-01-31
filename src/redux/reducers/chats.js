import {
  SEND_CHAT,
  EDIT_CHAT,
  DELETE_CHAT,
  FETCH_CHATS,
  SET_LAST_MESSAGE,
} from "../actions/chats/types";

import { toast } from "react-toastify";

const initialState = {
  chats: [],
  isLoading: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SEND_CHAT:
      toast.success("👍 Message sent!!! 👏");
      return {
        ...state,
        isLoading: false,
      };

    case DELETE_CHAT:
      return { ...state };

    case EDIT_CHAT:
      let index = state.chats.findIndex(
        (chat) => chat.id === action.payload.id
      );
      state.chats.splice(index, 1, action.payload);
      return { ...state };

    case FETCH_CHATS:
      return {
        chats: action.payload,
        isLoading: false,
      };

    case "LAST_MESSAGE":
      return {
        ...state,
        last_message: action.payload,
      };

    default:
      return state;
  }
};
