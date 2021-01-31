import { toast } from "react-toastify";
import TeamAdapter from "../../components/Tests/my-adapter";
import axios from "axios";
import * as types from "./types";
import { handleErrorResponse } from "../../components/Utils/errorHandler";
export const fetchTeams = () => (dispatch) => {
  const myAdapter = new TeamAdapter();
  axios
    .get("http://127.0.0.1:8000/teams")
    .then(async (res) => {
      let result = await myAdapter.toTeam(res.data);
      console.log("We got the following results from the server:", result);
      dispatch({
        type: types.FETCH_TEAMS,
        payload: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const createFeature = (formData, team) => (dispatch) => {
  var url = `http://127.0.0.1:8000/feature`;
  axios
    .post(`${url}/${team.name}`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch({
        type: types.NEW_FEATURE,
        payload: res.data.data,
      });
      toast.success("New Feature Created Successfully.");
    })
    .catch((err) => {
      let errResponse = handleErrorResponse(err);
      console.log("Err response:", errResponse);
      dispatch({
        type: types.NEW_FEATURE_ERR,
        payload: errResponse,
      });
    });
};

export const updateFeature = (formData, feature) => (dispatch) => {
  var url = `http://127.0.0.1:8000/feature`;
  axios
    .patch(`${url}/${feature._id}`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      dispatch({
        type: types.UPDATE_FEATURE,
        payload: res.data.data,
      });
      toast.success(res.data.message);
    })
    .catch((err) => {
      let errResponse = handleErrorResponse(err);
      console.log("Err response:", errResponse);
      dispatch({
        type: types.UPDATE_FEATURE_ERR,
        payload: errResponse,
      });
    });
};
