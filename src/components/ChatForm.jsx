import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { send_chat } from "../redux/actions/accounts/send_chat";
import { Send } from "@material-ui/icons";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { scroller } from "react-scroll";
import "./ChatForm.css";

const ChatForm = ({ receiverid, my_profile, send_chat, isAuthenticated }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && receiverid && my_profile?.userId) {
      send_chat(my_profile?.userId, receiverid, message);
      setMessage("");
      scroller.scrollTo("myScrollToElement", {
        duration: 1000,
        delay: 10,
        smooth: true,
        containerId: "chat__body",
        offset: 200, // Scrolls to element + 50 pixels down the page
      });
    } else {
      console.log("Failed to send message!!!!!");
      console.log("Because:", message, receiverid, my_profile?.userId);
    }
  };
  if (!isAuthenticated) return <Redirect to="/accounts/login" />;
  return (
    <div draggable="true" className="chat__form">
      <form onSubmit={handleSubmit}>
        <input
          className="chat__formControl"
          placeholder="Try a new message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="tools-wrapper">
          <img className="chat__formTools" src="editor_tools.png" alt="miss" />
          <Send cursor="pointer" onClick={handleSubmit} />
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.accounts.isAuthenticated,
  my_profile: state.accounts.my_profile,
});

ChatForm.propTypes = {
  isAuthenticated: PropTypes.bool,
  my_profile: PropTypes.object,
  send_chat: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { send_chat })(ChatForm);
