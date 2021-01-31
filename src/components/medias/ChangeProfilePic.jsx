import React, { useState, useEffect } from "react";
import { storage } from "../../firebase";
import { Avatar } from "@material-ui/core";
import { OpenInNew, DeleteOutline } from "@material-ui/icons";
import { set_profile_pic } from "../../redux/actions/accounts/set_profile_pic";
import firebase from "firebase";
import { connect } from "react-redux";
import { auth } from "../../firebase";
import { Bubbles } from "../Loader";
import "./ChangeProfilePic.css";
import PropTypes from "prop-types";

const ChangeProfilePic = ({ handleClose, set_profile_pic, my_profile }) => {
  const [file, setFile] = useState("");
  const [user, setUser] = useState("");
  const [showProcess, setShowProcess] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [currentProfilePic, setCurrentProfilePic] = useState(
    my_profile?.profile_pic ? my_profile?.profile_pic : file
  );
  useEffect(() => {
    const _user = auth.currentUser;
    if (_user) {
      setUser(_user);
    }
  }, [user]);

  const handleUpload = (event) => {
    event.preventDefault();
    setShowProcess(true);
    var storageRef = storage.ref();
    if (file) {
      const uploadTask = storageRef
        .child(`user_profile_pics/${file.name}`)
        .put(file);
      uploadTask.on(
        "state_changed",
        function (snapshot) {
          // var progress =
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // setProgress(progress);

          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              break;
            default:
          }
        },
        function (error) {
          // Handle unsuccessful uploads
          console.log(error.message);
        },
        function () {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
            if (user) {
              set_profile_pic(url, false);
              handleClose();
              setShowProcess(false);
            }
          });
        }
      );
    } else if (!file && removePhoto) {
      const imageref = storage.refFromURL(my_profile?.profile_pic);
      imageref
        .delete()
        .then(function () {
          // File deleted successfully
          set_profile_pic("", true);
          handleClose();
        })
        .catch(function (error) {
          // Uh-oh, an error occurred!
          console.log(
            "Failed to remove photo from the storage!!",
            error.message
          );
        });
    } else {
      console.log("Please choose a file before uploading!!!");
    }
  };

  const handlePhotoRemove = (e) => {
    e.preventDefault();

    if (document.querySelector("#new_img_prev_area") && !currentProfilePic) {
      document.querySelector("#new_img_prev_area").src =
        "https://cdn1.vectorstock.com/i/1000x1000/77/30/default-avatar-profile-icon-grey-photo-placeholder-vector-17317730.jpg";
    }

    setCurrentProfilePic("");
    setFile(false);
    setRemovePhoto(true);
  };

  const previewPic = (imgFile) => {
    if (imgFile && imgFile) {
      setFile(imgFile);
      var reader = new FileReader();
      reader.onload = function (e) {
        const imageViewArea = document.querySelector("#image_area>img");
        if (imageViewArea?.src) {
          imageViewArea.src = e.target.result;
        } else {
          document
            .querySelector("#image_area")
            .removeChild(document.querySelector("#image_area").childNodes[0]);
          var img = document.createElement("img"); // Create a <button> element
          img.id = "new_img_prev_area";
          img.src = e.target.result; // Insert img
          img.style = "width: 150px;object-fit: contain;";
          document.querySelector("#image_area").appendChild(img);
        }
      };
      reader.readAsDataURL(imgFile);
    } else {
      console.log("No file found");
    }
  };

  return (
    <div className="container">
      <div className="modal__container">
        <div className="modal__header">
          <h3>Change your profile picture</h3>
          <p>It'll be updated for all of your Microsoft 365 apps.</p>
        </div>
        <div className="modal__body">
          <div className="modal__bodyButtons">
            <form onSubmit={handleUpload}>
              <label class="custom-file-upload">
                <input
                  type="file"
                  onChange={(e) => previewPic(e.target.files[0])}
                />
                <OpenInNew /> <p>Upload picture</p>
              </label>
            </form>
            <div className="button__row">
              <DeleteOutline />{" "}
              <p onClick={handlePhotoRemove}>Remove picture</p>
            </div>
          </div>
          <div className="picture__preview">
            <Avatar id="image_area" src={currentProfilePic} alt="Profile Pic" />
            {showProcess && <Bubbles />}
          </div>
        </div>
        <div className="modal__footer">
          <button onClick={handleClose}>Close</button>
          <button onClick={handleUpload}>Save</button>
        </div>
      </div>
    </div>
  );
};

ChangeProfilePic.propTypes = {
  my_profile: PropTypes.object,
  set_profile_pic: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  my_profile: state.accounts.my_profile,
});

export default connect(mapStateToProps, { set_profile_pic })(ChangeProfilePic);
