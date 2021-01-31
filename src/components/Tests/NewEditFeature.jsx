import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomModal from "../CustomModal";
import { handleErrorResponse } from "../Utils/errorHandler";
import "./TestForm.css";

const NewEditFeature = ({
  isEditForm,
  team,
  feature,
  modalOpener,
  list,
  setList,
}) => {
  const [featureForm, setFeatureForm] = useState({
    name: "",
    platForm: "",
    discProject: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditForm)
      setFeatureForm({
        name: feature.name,
        platForm: feature.platForm,
        discProject: feature.discProject.join(),
      });
  }, [feature]);

  const handleCreateUpdate = () => {
    const formData = {
      ...featureForm,
      discProject: featureForm.discProject.split(","),
    };
    const url = `http://127.0.0.1:8000/feature`;
    if (isEditForm)
      axios
        .patch(`${url}/${feature._id}`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          //finding index for the current feature of the current team
          const index = team.features.findIndex(
            (item) => item._id === feature._id
          );
          //replacing the old feature with updated feature in the current team
          team.features.splice(index, 1, res.data.data);
          //updating the teamList with the updated current team
          let newList = list.map((tm) => {
            if (tm.name === team.name) {
              return { ...team }; //replaing team with old feature with updated one
            } else {
              return { ...tm }; //simply appending the rest teams to the list
            }
          });
          setList([...newList]);
          toast.success(res.data.message);
        })
        .catch((err) => {
          let errResponse = handleErrorResponse(err);
          console.log("Err response:", errResponse);
          setError(err?.response?.data?.message);
          setTimeout(() => {
            setError("");
          }, 4000);
        });
    else {
      axios
        .post(`${url}/${team.name}`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          team.features.push(res.data.data);
          const index = list.findIndex((item) => item._id === team._id);
          list.splice(index, 1, team);
          setList([...list]);
          setFeatureForm({
            name: "",
            platForm: "",
            discProject: "",
          });
          toast.success("New Feature Created Successfully.");
        })
        .catch((err) => {
          let errResponse = handleErrorResponse(err);
          console.log("Err response:", errResponse);
          setError(err?.response?.data?.message);
          setTimeout(() => {
            setError("");
          }, 4000);
        });
    }
  };

  return (
    <CustomModal
      opener={modalOpener}
      header={isEditForm ? "Update Feature Here" : "Create New Feature"}
    >
      <div className="test__form__group">
        {error && <span className="form__error__msg">{error}</span>}
        <input
          value={featureForm.name}
          placeholder="Feature Name"
          onChange={(e) =>
            setFeatureForm({ ...featureForm, name: e.target.value })
          }
        />
        <input
          value={featureForm.platForm}
          placeholder="Feature PlatForm"
          onChange={(e) =>
            setFeatureForm({ ...featureForm, platForm: e.target.value })
          }
        />
        <input
          value={featureForm.discProject}
          placeholder="Disclosure Projects"
          onChange={(e) =>
            setFeatureForm({ ...featureForm, discProject: e.target.value })
          }
        />
        <button onClick={handleCreateUpdate}>
          {isEditForm ? "Save Changes" : "Create"}
        </button>
      </div>
    </CustomModal>
  );
};

export default NewEditFeature;
