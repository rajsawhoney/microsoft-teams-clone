import React from "react";
import { Avatar } from "@material-ui/core";
import Moment from "react-moment";
import "./ContactProfile.css";
const ContactProfile = ({ name, lastMessage, lastDate, profilePic }) => {
  return (
    <div className="profile__main">
      <Avatar src={profilePic} alt={name} />
      <div className="profile__info">
        <div className="name-time-stamp-container">
          <h3>{name.toUpperCase()}</h3>
          <span className="last-seen-time-stamp">
            {lastDate?.seconds ? (
              <Moment fromNowDuring={86400000} toNow format="DD/MM">
                {lastDate.seconds * 1000}
              </Moment>
            ) : (
              <strong>NEW</strong>
            )}
          </span>
        </div>
        <p>{lastMessage.slice(0, 30)}...</p>
      </div>
    </div>
  );
};

export default ContactProfile;
