import React, { useState } from "react";
import { Avatar } from "@material-ui/core";
import Moment from "react-moment";
import { connect } from "react-redux";
import ProfileLoader from "./Utils/ProfileLoader";
import { MoreHoriz } from "@material-ui/icons";
import { edit_chat } from "../redux/actions/chats/edit_chat";
import "./MessageCard.css";

const MessageCard = ({
  is_my_message,
  name,
  profilePic,
  messageDate,
  message,
  edit_chat,
  id,
}) => {
  const [editMode, setEditMode] = useState(false);
  const handleEdit = () => {
    const updated_chat = document.getElementById(`chat-message-${id}`)
      .innerText;
    edit_chat(id, updated_chat);
    setEditMode(false);
  };
  if (is_my_message === "undefined") return <ProfileLoader />;
  return (
    <div
      id="message-card"
      className={
        (is_my_message && "message__card__right") || "message__card__left"
      }
    >
      {!is_my_message ? (
        <Avatar src={profilePic ? profilePic : "Loading..."} />
      ) : null}

      <div
        className={
          (is_my_message && "to_message__cardBody") || "from_message__cardBody"
        }
      >
        {!is_my_message ? (
          <div className="from__message__name__date__wrapper">
            <h3>{name ? name : <ProfileLoader />}</h3>
            <span>
              <Moment fromNow>{messageDate?.seconds * 1000}</Moment>
            </span>
            <MoreHoriz />
          </div>
        ) : (
          <h4>
            <Moment fromNow>{messageDate?.seconds * 1000}</Moment>
            <MoreHoriz onClick={() => setEditMode(true)} />
          </h4>
        )}
        <p
          id={`chat-message-${id}`}
          style={{
            backgroundColor: editMode ? "white" : null,
            padding: editMode ? "5px 10px" : null,
          }}
          contentEditable={editMode}
          onKeyPress={(key) => {
            if (key.key === "Enter") {
              handleEdit();
            }
          }}
        >
          {message}
        </p>
        {editMode ? (
          <button style={{ float: "right" }} onClick={handleEdit}>
            Done
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default connect(null, { edit_chat })(MessageCard);
