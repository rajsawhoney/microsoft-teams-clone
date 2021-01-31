import * as types from "../actions/types";
const initialState = {
  loading: false,
  error: false,
  message: "",
  list: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_TEAMS:
      console.log(action);
      return {
        ...state,
        loading: false,
        error: false,
        message: "Teams fetched successfully",
        list: action.payload,
      };

    case types.FETCH_TEAMS_ERR:
      return {
        ...state,
        error: true,
        loading: false,
        message: "Failed to fetch teams",
      };

    default:
      return state;
  }
};
