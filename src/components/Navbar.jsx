import React, { useState } from "react";
import "./Navbar.css";
import { Search, Clear } from "@material-ui/icons";
import { Avatar } from "@material-ui/core";
import AppsIcon from "@material-ui/icons/Apps";
import { Link } from "react-router-dom";
import Popover from "@material-ui/core/Popover";
import ProfilePopOver from "./ProfilePopOver";
import { connect } from "react-redux";
import { logout } from "../redux/actions/accounts/logout";
import PropTypes from "prop-types";

const Navbar = ({ logout, user, my_profile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const profilePopover = (
    <Popover
      id="mouse-over-popover"
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      onClose={handlePopoverClose}
      disableRestoreFocus
    >
      <ProfilePopOver my_profile={my_profile} handleLogout={handleLogout} />
    </Popover>
  );
  return (
    <>
      <div className="navbar__header">
        <div className="navbar__headerLeft">
          <AppsIcon />
          <h2>
            <Link to="/"> Microsoft Teams Clone </Link>
          </h2>

          <div className="search__box">
            <Search />
            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              value={searchTerm}
            />
            {searchTerm ? (
              <Clear
                className="search__boxClear"
                cursor="pointer"
                onClick={() => setSearchTerm("")}
              />
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="navbar__headerRight">
          <Avatar
            id={open ? "mouse-over-popover" : undefined}
            onClick={handlePopoverOpen}
            src={my_profile?.profile_pic}
            alt={my_profile?.displayName}
          />
          {profilePopover}
        </div>
      </div>
    </>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
};
const mapStateToProps = (state) => ({
  user: state.accounts.user,
  isAuthenticated: state.accounts.isAuthenticated,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, { logout })(Navbar);
