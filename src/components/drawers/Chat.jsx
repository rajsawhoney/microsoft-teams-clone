import React from "react";
import {
  KeyboardArrowDown,
  BorderColorOutlined,
  ArrowDropDown,
} from "@material-ui/icons";
import "./Chat.css";
import ContactProfile from "../ContactProfile";
import { Link } from "react-router-dom";
const Chat = ({ user_profiles }) => {
  return (
    <div className="chat__main">
      <div className="chat__header">
        <div className="chat__headerLeft">
          <h2>Chat</h2>
          <KeyboardArrowDown />
        </div>

        <div className="chat__headerRight">
          <img src="filter.svg" alt="mis" />
          <BorderColorOutlined />
        </div>
      </div>

      {/* end of chat__header */}

      <div className="chat__recentHeader">
        <ArrowDropDown />
        <p>Recent</p>
      </div>
      <div className="chat__recentList">
        {user_profiles?.map((item, ind) => (
          <Link key={item.userId} to={`/chat/chat-detail/${item.userId}`}>
            <ContactProfile
              name={item.displayName}
              lastMessage={
                item?.last_message?.message
                  ? item?.last_message?.message
                  : item?.about_me
              }
              profilePic={item.profile_pic}
              lastDate={
                item?.last_message?.posted_on
                  ? item?.last_message?.posted_on
                  : "New"
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Chat;
