import { AUTH_STATUS } from "./types";

export const auth_status = (user,status) => (dispatch) => {
  dispatch({
    type: AUTH_STATUS,
    payload: { user: user, status: status },
  });
};
