import React from "react";
import { Link } from "react-router-dom";

const AppsComp = () => {
  return (
    <>
      <h2>Enter to Play</h2>
      <Link
        className={{
          fontSize: "2rem",
          textDecoration: "unset",
          color: "crimson",
          textShadow: "2px 1px 2px green",
          cursor: "pointer",
        }}
        to="/apps/play-piono"
      >
        Piono
      </Link>
      <Link
        className={{
          fontSize: "2rem",
          textDecoration: "unset",
          color: "crimson",
          textShadow: "2px 1px 2px green",
          cursor: "pointer",
        }}
        to="/apps/play-drum"
      >
        Drum
      </Link>
    </>
  );
};

export default AppsComp;
