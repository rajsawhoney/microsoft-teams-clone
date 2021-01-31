import { INITIALIZE_PC } from "./types";
export const setup_pc = (pc) => (dispatch) => {
    console.log("Setting up pc...");
  dispatch({
    type: INITIALIZE_PC,
    payload: pc,
  });
};
