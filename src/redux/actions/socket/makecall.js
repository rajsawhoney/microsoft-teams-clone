import { MAKECALL } from "./types";

export const makecall = () => (dispatch) => {
  dispatch({
    type: MAKECALL,
    payload: true,
  });
};
