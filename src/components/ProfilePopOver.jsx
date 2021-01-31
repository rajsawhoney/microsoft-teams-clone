import React, { useState, useRef } from "react";
import { Avatar, Divider } from "@material-ui/core";
import { connect } from "react-redux";
import {
  Settings,
  KeyboardArrowRight,
  BookmarkBorderOutlined,
  CheckCircleOutline,
  EditOutlined,
  DeleteOutline,
} from "@material-ui/icons";
import "./ProfilePopOver.css";

import Modal from "@material-ui/core/Modal";
import { update_profile_status } from "../redux/actions/accounts/update_profile_status";
import ChangeProfilePic from "./medias/ChangeProfilePic";
import { toast } from "react-toastify";

function ProfilePopOver({ handleLogout, my_profile, update_profile_status }) {
  const [open, setOpen] = React.useState(false);
  const [statusEditable, setStatusEditable] = useState(false);
  const [displayNameEditable, setDisplayNameEditable] = useState(false);
  const contentEditRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submitStatus = (e) => {
    e.preventDefault();
    const updatedStatus = document.querySelector("#profile-status-container")
      .innerHTML;
    if (my_profile) {
      update_profile_status(false, updatedStatus, my_profile.userId);
      setStatusEditable(false);
    } else
      toast.error(
        "Something went wrong! We are working on it & we'll fix it soon..."
      );
  };

  const submitName = (e) => {
    e.preventDefault();
    const updatedName = document.querySelector("#display-name-container")
      .innerHTML;
    console.log("Updated Name:", updatedName);
    if (my_profile) {
      update_profile_status(true, updatedName, my_profile.userId);
      setDisplayNameEditable(false);
    } else
      toast.error(
        "Something went wrong! We are working on it & we'll fix it soon..."
      );
  };

  const handleDeleteButton = () => {
    const statusContainer = document.querySelector("#profile-status-container");
    statusContainer.innerHTML = "";
  };
  const handleEditButton = (e) => {
    setStatusEditable(!statusEditable);
    contentEditRef.current.focus();
  };

  return (
    <div className="profile__container">
      <div className="profile__header">
        <Avatar src={my_profile?.profile_pic} alt={my_profile?.displayName} />
        <div className="name__profile__control__wrapper">
          <h4
            onClick={() => setDisplayNameEditable(true)}
            id="display-name-container"
            className={displayNameEditable && "name_editable"}
            contentEditable={displayNameEditable}
          >
            {my_profile?.displayName?.toUpperCase()}
          </h4>

          <p onClick={handleOpen}>Change Profile</p>
        </div>
        {displayNameEditable && (
          <button className="display_name_btn" onClick={submitName}>
            Update
          </button>
        )}
      </div>
      <div className="profile__onlineStatus">
        <p className="availableWithIcon">
          <CheckCircleOutline />
          Available
        </p>
        <KeyboardArrowRight />
      </div>
      <div
        ref={contentEditRef}
        contentEditable={statusEditable}
        style={{ backgroundColor: statusEditable && "lightcyan" }}
        className="profile__status"
      >
        <p id="profile-status-container">
          {my_profile?.about_me
            ? my_profile.about_me
            : "One day you'll just be a memory to some people, so do your best to be the good one..."}
        </p>
        <div className="profile__status__edit__buttons">
          <EditOutlined onClick={handleEditButton} />
          <DeleteOutline onClick={handleDeleteButton} />
        </div>
      </div>
      {statusEditable && (
        <>
          Now try updating your status and once you are done click 👍Done below:
          <button
            className="profile__status__submit__btn"
            onClick={submitStatus}
          >
            Done
          </button>
        </>
      )}
      <div className="profile__settingStuffs">
        <div className="badgeIcon">
          <BookmarkBorderOutlined />
          <p>Saved</p>
        </div>
        <div className="badgeIcon">
          <Settings />
          <p>Settings</p>
        </div>
      </div>

      <Divider />
      <div className="profile__extras">
        <p>Keyboard shortcuts</p>
        <div className="profile__about">
          <p>About</p>
          <KeyboardArrowRight />
        </div>
        <p>Donwload the desktop app</p>
        <p>Donwload the mobile app </p>
      </div>
      <Divider />
      <p className="signout__btn" onClick={handleLogout}>
        Sign out
      </p>

      <Modal
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <ChangeProfilePic handleClose={handleClose} />
      </Modal>
    </div>
  );
}

export default connect(null, { update_profile_status })(ProfilePopOver);
