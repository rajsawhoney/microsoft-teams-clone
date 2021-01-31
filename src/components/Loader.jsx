import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./Loader.css";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
}));

export default function Loader() {
  const classes = useStyles();

  return <div className="loader__container"></div>;
}

export function Bubbles() {
  return (
    <div>
      <div className="waiting-animation">
        <div className="wait-dot-1"></div>
        <div className="wait-dot-2"></div>
        <div className="wait-dot-3"></div>
        <div className="wait-dot-4"></div>
        <div className="wait-dot-5"></div>
      </div>
    </div>
  );
}
