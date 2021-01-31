import { INITIALIZE_SOCKET } from "./types";
export const setup_socket = (socket) => (dispatch) => {
  dispatch({
    type: INITIALIZE_SOCKET,
    payload: socket,
  });
};
