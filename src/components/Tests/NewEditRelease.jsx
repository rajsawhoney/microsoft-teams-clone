import axios from "axios";
import React, { useState, useEffect } from "react";
import { AddOutlined, KeyboardArrowDown, Cancel } from "@material-ui/icons";
import DatePicker from "react-date-picker";
import { toast } from "react-toastify";
import CustomModal from "../CustomModal";
import { handleErrorResponse } from "../Utils/errorHandler";
import "./TestForm.css";

const NewEditRelease = ({
  isEditForm,
  team,
  release,
  modalOpener,
  list,
  setList,
}) => {
  const [addPhase, setAddPhase] = useState(false);
  const [phaseList, setPhaseList] = useState([]);

  const [phase, setPhase] = useState({
    name: "",
    description: "",
    posted_on: new Date(),
  });

  const handleAddPhase = () => {
    setPhaseList([...phaseList, phase]);
    setPhase({
      name: "",
      description: "",
      posted_on: new Date(),
    });
  };

  const handleEditPhase = (data) => {
    setPhase(data);
    setAddPhase(!addPhase);
  };

  const handleCancelPhase = (item) => {
    setPhaseList(phaseList.filter((ph) => ph.name !== item.name));
  };

  const [releaseForm, setReleaseForm] = useState({
    name: "",
    botName: "",
    phases: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditForm) {
      setReleaseForm({
        name: release?.name,
        botName: release?.botName,
        phases: release?.phases,
      });
      setPhaseList(release?.phases);
    }
  }, [release]);

  const handleCreateUpdate = () => {
    const formData = {
      ...releaseForm,
      phases: phaseList,
    };
    const url = `http://127.0.0.1:8000/release`;
    if (isEditForm)
      axios
        .patch(`${url}/${release._id}`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          //finding index for the current release of the current team
          const index = team.releases.findIndex(
            (item) => item._id === release._id
          );
          //replacing the old release with updated release in the current team
          team.releases.splice(index, 1, res.data.data);
          //updating the teamList with the updated current team
          let newList = list.map((tm) => {
            if (tm.name === team.name) {
              return { ...team }; //replaing team with old release with updated one
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
          team.releases.push(res.data.data);
          const index = list.findIndex((item) => item._id === team._id);
          list.splice(index, 1, team);
          setList([...list]);
          setReleaseForm({
            name: "",
            botName: "",
            phases: "",
          });
          toast.success("New Release Created Successfully.");
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
      header={isEditForm ? "Update Release Here" : "Create New Release"}
    >
      <div className="test__form__group">
        {error && <span className="form__error__msg">{error}</span>}
        <input
          value={releaseForm.name}
          placeholder="Release Name"
          onChange={(e) =>
            setReleaseForm({ ...releaseForm, name: e.target.value })
          }
        />
        <input
          value={releaseForm.botName}
          placeholder="BotName"
          onChange={(e) =>
            setReleaseForm({ ...releaseForm, botName: e.target.value })
          }
        />

        <div className="comment__list">
          {phaseList.map((item) => (
            <span key={item.posted_on}>
              <p onClick={() => handleEditPhase(item)}>{item.name}</p>{" "}
              <Cancel onClick={() => handleCancelPhase(item)} />
            </span>
          ))}
        </div>
        <p style={{ display: "inline-flex" }}>
          Add Phase
          <KeyboardArrowDown
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => setAddPhase(!addPhase)}
          />
        </p>
        {addPhase && (
          <div className="comment__form">
            <input
              placeholder="Phase Name"
              required
              value={phase.name}
              onChange={(e) => setPhase({ ...phase, name: e.target.value })}
            />
            <input
              required
              placeholder="Your description here"
              value={phase.description}
              onChange={(e) =>
                setPhase({ ...phase, description: e.target.value })
              }
            />
            <DatePicker
              // showTimeSelect
              value={phase.posted_on}
              onChange={(date) => setPhase({ ...phase, posted_on: date })}
            />

            <button onClick={handleAddPhase}>
              Add <AddOutlined />
            </button>
          </div>
        )}
        <button onClick={handleCreateUpdate}>
          {isEditForm ? "Save Changes" : "Create"}
        </button>
      </div>
    </CustomModal>
  );
};

export default NewEditRelease;
