import { ENDCALL } from "./types";

export const endcall = () => (dispatch) => {
  dispatch({
    type: ENDCALL,
    payload: false,
  });
};
