import { INITIALIZE_SOCKET,INITIALIZE_PC, MAKECALL, ENDCALL } from "../actions/socket/types";

import { toast } from "react-toastify";

const initialState = {
  socket: null,
  pc: null,
  isCalling: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_SOCKET:
      return {
        ...state,
        socket: action.payload,
      };

    case INITIALIZE_PC:
      return {
        ...state,
        pc: action.payload,
      };

    case MAKECALL:
      return {
        ...state,
        isCalling: action.payload,
      };

    case ENDCALL:
      toast.warning("Call Ended!!!");
      return {
        ...state,
        isCalling: action.payload,
      };

    default:
      return state;
  }
};
