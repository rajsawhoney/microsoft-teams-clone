import React, { useState, useEffect } from "react";
import { Close } from "@material-ui/icons";
import "./CustomModal.css";

const CustomModal = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const custom_modal = document.getElementById("my-custom-modal");
    window.onclick = (event) => {
      if (event.target == custom_modal) {
        handleClose();
      }
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <span className="custom__modal__opener" onClick={handleOpen}>
        {props.opener}
      </span>
      <div
        id="my-custom-modal"
        style={{ display: open ? "flex" : "none" }}
        className="custom__modal__container"
      >
        <div className="custom__modal__body__container">
          <div className="custom__modal__header">
            <span>{props.header}</span>
            <Close
              style={{ color: "red", cursor: "pointer" }}
              onClick={handleClose}
            />
          </div>
          <div className="custom__modal__body">{props.children}</div>
          <div className="custom__modal__footer">{props.footer}</div>
        </div>
      </div>
    </>
  );
};

export default CustomModal;
