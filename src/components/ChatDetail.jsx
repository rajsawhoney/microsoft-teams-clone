import React, { useEffect } from "react";
import "./ChatDetail.css";
import { auth } from "../firebase";
import {
  Videocam,
  Phone,
  GroupAddOutlined,
  AddOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@material-ui/icons";
import { Avatar } from "@material-ui/core";
import MessageCard from "./MessageCard";
import ChatForm from "../components/ChatForm";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { db } from "../firebase";
import { fetch_chats } from "../../src//redux/actions/chats/fetch_chats";
import { set_last_message } from "../redux/actions/accounts/set_last_message";
import { set_partnerProfile } from "../../src/redux/actions/accounts/set_partnerProfile";
import { useParams, Link } from "react-router-dom";
import { Element, scroller } from "react-scroll";
import { Bubbles } from "./Loader";
import ProfileLoader from "./Utils/ProfileLoader";

const ChatDetail = ({
  fetch_chats,
  chats,
  isLoading,
  my_profile,
  set_last_message,
  partner_profile,
  set_partnerProfile,
  slideUpNow,
  setSlideUpNow,
}) => {
  const params = useParams();

  const loc = window.location.hash;

  useEffect(() => {
    if (!loc.includes("chat-detail")) {
      setSlideUpNow(false);
    }
  }, [loc, params.userId]);

  useEffect(() => {
    let chat__body__elem = document.querySelector("#chat__body");
    if (slideUpNow) {
      chat__body__elem.classList.add("slide__up__chat__body");
    } else {
      chat__body__elem.classList.remove("slide__up__chat__body");
    }
  }, [slideUpNow]);

  useEffect(() => {
    set_partnerProfile(params.userId);
  }, [params.userId]);

  useEffect(() => {
    let unsubscribe;
    var user = auth.currentUser;
    if (user != null && params?.userId) {
      unsubscribe = db
        .collection("chats")
        .where("members", "in", [
          [params.userId, user.uid],
          [user.uid, params.userId],
        ])
        .onSnapshot(function (querySnapshot) {
          const doc = querySnapshot?.docs[0];
          if (doc) {
            set_last_message(doc.data().lastMessage, params.userId);
            fetch_chats([...doc.data().messages]);
          } else {
            fetch_chats();
          }
          scroller.scrollTo("myScrollToElement", {
            duration: 1000,
            delay: 100,
            smooth: true,
            containerId: "chat__body",
            offset: 1000, // Scrolls to element + 50 pixels down the page
          });
        });
    }
    return () => {
      unsubscribe();
    };
  }, [params.userId, my_profile]);

  return (
    <div id="scroll-to-bottom" className="chat__detailMain">
      <div id="chat__header" className="chat__detailHeader">
        <div className="chat__detailLeftHeader">
          {slideUpNow ? (
            <KeyboardArrowDown
              onClick={() => setSlideUpNow(!slideUpNow)}
              className="arrow__up"
            />
          ) : (
            <KeyboardArrowUp
              onClick={() => setSlideUpNow(!slideUpNow)}
              className="arrow__up"
            />
          )}
          {partner_profile ? (
            <Avatar
              src={partner_profile?.profile_pic}
              alt={partner_profile?.displayName}
            />
          ) : (
            <ProfileLoader />
          )}
          <h2>
            {partner_profile?.displayName ? (
              partner_profile?.displayName
            ) : (
              <ProfileLoader />
            )}
          </h2>
          <p style={{ borderBottom: "3px solid #464775b2" }}>Chat</p>
          <p>Files</p>
          <p>Organisation</p>
          <p>Activity</p>
          <AddOutlined />
        </div>
        <div className="chat__detailRightHeader">
          <Link to={`/calling/${partner_profile?.userId}`}>
            <Videocam />
          </Link>
          <Link to={`/calling/${partner_profile?.userId}`}>
            <Phone />
          </Link>
        </div>
        <GroupAddOutlined />
      </div>
      <div id="chat__body" className="chat__detailBody">
        {!isLoading ? (
          chats?.map((item, ind) => (
            <MessageCard
              key={item?.id}
              id={item.id}
              is_my_message={my_profile?.userId == item?.user_id ? true : false}
              profilePic={partner_profile?.profile_pic}
              name={partner_profile?.displayName}
              messageDate={item?.posted_on}
              message={item?.message}
            />
          ))
        ) : (
          <center>
            <Bubbles />
          </center>
        )}

        <Element name="myScrollToElement"></Element>
      </div>
      <div className="chat__form___container">
        <ChatForm receiverid={partner_profile?.userId} />
      </div>
    </div>
  );
};

ChatDetail.propTypes = {
  partner_profile: PropTypes.object,
  chats: PropTypes.array,
  isLoading: PropTypes.bool,
  fetch_chats: PropTypes.func.isRequired,
  set_last_message: PropTypes.func.isRequired,
  set_partnerProfile: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  chats: state.chats.chats,
  isLoading: state.chats.isLoading,
  my_profile: state.accounts.my_profile,
  partner_profile: state.accounts.partner_profile,
});

export default connect(mapStateToProps, {
  fetch_chats,
  set_partnerProfile,
  set_last_message,
})(ChatDetail);
