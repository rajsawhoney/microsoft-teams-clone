import React from "react";
import "./Sidebar.css";
import { CreateTwoTone, MoreVert } from "@material-ui/icons";

const Sidebar = ({ currentSlack }) => {
  return (
    <div className="sidebar__main">
      <div className="sidebar__header">
        <h2>{currentSlack}</h2>
        <CreateTwoTone cursor="pointer" />
      </div>
      <div className="sidebar__lists">
        <div className="sidebar__listHeader">
          <MoreVert cursor="pointer" />
          <h3>Browse Slack</h3>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
