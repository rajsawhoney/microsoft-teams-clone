import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import List from "@material-ui/core/List";
import Navbar from "./Navbar";
import "./Drawer.css";
import { auth } from "../firebase";
import Piono from "./medias/Piono";
import DrumKit from "./medias/DrumKit";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import {
  Notifications,
  AddComment,
  People,
  AssignmentIndOutlined,
  DateRange,
  Phone,
  MoreHoriz,
  HelpOutline,
  Apps,
} from "@material-ui/icons";
import Activity from "./drawers/Activity";
import Chat from "./drawers/Chat";
import Teams from "./drawers/Teams";
import Assignments from "./drawers/Assignments";
import Calendar from "./drawers/Calendar";
import Calls from "./drawers/Calls";
import More from "./drawers/More";
import Loader from "./Loader";

import ChatDetail from "./ChatDetail";
import { connect } from "react-redux";
import { auth_status } from "../redux/actions/accounts/auth_status";
import PropTypes from "prop-types";
import { retrieve_profiles } from "../redux/actions/accounts/retrieve_profiles";
import { set_myprofile } from "../redux/actions/accounts/set_myprofile";
import Welcome from "../pages/Home";
import CallerUI from "./medias/CallerUI";
import IncomingCall from "./medias/IncomingCall";
import TestForm from "../components/Tests/TestForm";
import AppComp from "./drawers/AppsComp";

const drawerWidth = 80;
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    width: `calc(100%)`,
    marginLeft: drawerWidth,
    background: "#464775",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    zIndex: "-1",
  },
  drawerPaper: {
    width: drawerWidth,
    background: "#33344a",
    color: "lightgray",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

function DashBoard({
  isAuthenticated,
  isLoading,
  auth_status,
  retrieve_profiles,
  user_profiles,
  my_profile,
  set_myprofile,
}) {
  const [slideUpNow, setSlideUpNow] = useState(false);
  const classes = useStyles();
  const hashUrl = window.location.href;

  useEffect(() => {
    if (!hashUrl.includes("chat-detail")) {
      setSlideUpNow(false);
    }
  }, [hashUrl]);

  // ectch
  useEffect(() => {
    setTimeout(() => {
      let sidebar__detail__elem = document.querySelector(
        "#side__detail__identifier"
      );
      if (slideUpNow && sidebar__detail__elem) {
        sidebar__detail__elem.classList.add("slide__up__sidebar");
      } else if (!slideUpNow && sidebar__detail__elem) {
        sidebar__detail__elem.classList.remove("slide__up__sidebar");
      }
    }, 100);
  }, [slideUpNow]);

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        auth_status(user, true);
      } else {
        auth_status(null, false);
      }
    });
    retrieve_profiles();
  }, [isAuthenticated]);

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        set_myprofile(user.uid);
      }
    });
  }, [isAuthenticated]);

  if (isLoading) {
    return <Loader />;
  } else if (!isLoading && !isAuthenticated) {
    return <Redirect to="/accounts/login" />;
  } else if (isAuthenticated)
    return (
      <Router>
        <Switch>
          <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
              <Navbar my_profile={my_profile} />
            </AppBar>
            <div className="drawer__main">
              <div className="sidebar__buttonContainer">
                <List className="sidebar__TopContainer">
                  {[
                    { text: "Activity", icon: <Notifications /> },
                    { text: "Chat", icon: <AddComment /> },
                    { text: "Teams", icon: <People /> },
                    { text: "Assignments", icon: <AssignmentIndOutlined /> },
                    { text: "Calendar", icon: <DateRange /> },
                    { text: "Calls", icon: <Phone /> },
                    { text: " ", icon: <MoreHoriz /> },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={`/${item.text.toLowerCase()}`}
                      className={
                        (hashUrl?.includes(item.text.toLocaleLowerCase()) &&
                          "highlightTab sidebar__buttons") ||
                        "unhighlightTab sidebar__buttons"
                      }
                    >
                      {item.icon}
                      <p>{item.text}</p>
                    </Link>
                  ))}
                </List>
                <List
                  className="sidebar__BottomContainer"
                  style={{ bottom: "0px" }}
                >
                  {[
                    { text: "Apps", icon: <Apps /> },
                    { text: "Help", icon: <HelpOutline /> },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={`/${item.text.toLowerCase()}`}
                      className="sidebar__bottom__buttons"
                    >
                      {item.icon}
                      <p>{item.text}</p>
                    </Link>
                  ))}
                </List>
              </div>
            </div>
            <main className="sidebar__contentSection">
              <Route exact path="/calling/:userId" component={CallerUI} />
              <Route
                exact
                path="/incoming-call/:userId/:roomId"
                component={IncomingCall}
              />

              <div className="sidebar__viewarea">
                {[
                  { path: "/activity", comp: <Activity /> },
                  { path: "/apps", comp: <AppComp /> },
                  {
                    path: "/chat",
                    comp: <Chat user_profiles={user_profiles} />,
                  },
                  { path: "/teams", comp: <Teams /> },
                  { path: "/assignments", comp: <Assignments /> },
                  { path: "/calls", comp: <Calls /> },
                  { path: "/more", comp: <More /> },
                  { path: "/calendar", comp: <Calendar /> },
                  { path: "/", comp: <Welcome about={true} /> },
                ].map((item, index) => {
                  if (item.path === "/") {
                    return (
                      <Route exact key={index} path={item.path}>
                        {item.comp}
                      </Route>
                    );
                  } else {
                    return (
                      <Route key={index} path={item.path}>
                        {item.comp}
                      </Route>
                    );
                  }
                })}
              </div>
              <div
                id="side__detail__identifier"
                className="sidebar__detailView"
              >
                <Route exact path="/" component={Welcome} />
                <Route
                  exact
                  path="/chat/chat-detail/:userId"
                  render={() => (
                    <ChatDetail
                      slideUpNow={slideUpNow}
                      setSlideUpNow={setSlideUpNow}
                    />
                  )}
                />

                <Route exact path="/teams/detail/" component={TestForm} />
                <Route exact path="/apps/play-piono" component={Piono} />
                <Route exact path="/apps/play-drum" component={DrumKit} />
              </div>
            </main>
          </div>
        </Switch>
      </Router>
    );
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.accounts.isAuthenticated,
  isLoading: state.accounts.isLoading,
  user_profiles: state.accounts.user_profiles,
  my_profile: state.accounts.my_profile,
});

DashBoard.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  my_profile: PropTypes.object,
  user_profiles: PropTypes.array,
  auth_status: PropTypes.func.isRequired,
  retrieve_profiles: PropTypes.func.isRequired,
  set_myprofile: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, {
  auth_status,
  retrieve_profiles,
  set_myprofile,
})(DashBoard);
