import React from "react";

const VideoCall = () => {
  const localVideoref = React.createRef();
  navigator.mediaDevices
    .getUserMedia({ video: false })
    .then((stream) => {
      localVideoref.current.srcObject = stream;
    })
    .catch((err) => console.log("Failed to getUserMedia!!!,", err));
  return (
    <div className="video__call">
      <video ref={localVideoref} autoPlay></video>
    </div>
  );
};

export default VideoCall;
