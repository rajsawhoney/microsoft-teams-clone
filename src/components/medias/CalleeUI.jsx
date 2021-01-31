import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Videocam,
  VideocamOff,
  MoreHoriz,
  Comment,
  CallEnd,
  OpenInBrowser,
  LinearScale,
  Mic,
  MicOff,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import ProfileLoader from "../Utils/ProfileLoader";
import "./CalleeUI.css";
import { endcall } from "../../redux/actions/socket/endcall";
import { makecall } from "../../redux/actions/socket/makecall";

const CalleeUI = ({ callerProfile, socket, endcall, makecall, isCalling }) => {
  const history = useHistory();
  const [isMicOff, setIsMicOff] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [mediaController, setMediaController] = useState();
  const [isOnCall, setIsOnCall] = useState(false);
  let candidatesArray = [];

  let pc = null;
  var peerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

  const calleeLocalVidRef = useRef();
  const calleeRemoteVidRef = useRef();

  const configuration = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 20,
  };

  if (pc === null) {
    pc = new peerConnection(configuration);
  }

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        const dt = JSON.parse(data);

        switch (dt.type) {
          case "offer":
            console.log("Offr ent triggered!!!");
            pc && onOffer(dt);
            break;

          case "candidate":
            onCandidate(dt);
            break;

          case "leave":
            console.log("leave event triggered!!!!");
            onLeave();
            break;

          default:
            break;
        }
      });
    } else {
      console.log("NO SOCKET CONN FOUND!!!!", socket);
    }
  }, [socket]);

  useEffect(() => {
    if (pc) {
      openUserMedia();
      makecall();
      registerpcListeners();
    } else {
      console.log("Unable to open web-cam because of ", pc);
    }
  }, []);

  useEffect(() => {
    if (pc && candidatesArray.length) {
      console.log("Now adding candidate from array to PC>>>");
      candidatesArray.forEach((cand) =>
        pc.addIceCandidate(new RTCIceCandidate(cand))
      );
    }
  }, [candidatesArray, pc]);

  const onCandidate = (data) => {
    if (pc === null) {
      console.log("Candidate pushed to array from caller side...");
      candidatesArray.push(data.candidate);
      return;
    }
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  if (pc) {
    pc.ontrack = function (obj) {
      console.log("Got track from the remote pEEr!!!", obj.streams);
      setTimeout(() => {
        calleeRemoteVidRef.current.srcObject = obj.streams[0];
      }, 2000);
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log("Callee Side: Got final candidate!");
        return;
      }
      console.log(
        "Callee Side: Got new candidate and sending to the caller side ",
        event.candidate
      );

      if (socket) {
        socket.emit(
          "message",
          JSON.stringify({
            type: "candidate",
            sendto: "um4de1m2UDNlePNXBQhA2musGt33",
            candidate: event.candidate,
          })
        );
      } else {
        console.log(
          "Unable to send candidate to the caller side due to ",
          callerProfile,
          socket
        );
      }
    };
  } else {
    console.log("NO PC CONN!!!!");
  }

  const onOffer = (data) => {
    console.log("Setting remoteDesc out of offer and Creating Answer");
    pc.setRemoteDescription(data.offer);
    pc.createAnswer()
      .then((answer) => {
        // set answer sdp as local description
        pc.setLocalDescription(answer);
        console.log("Got answer sdp as ", answer);
        socket.emit(
          "message",
          JSON.stringify({
            type: "answer",
            caller: data.caller,
            callee: data.callee,
            answer: answer,
          })
        );
      })
      .catch((err) => {
        console.log("Failed to create answer to the incoming offer!!!");
      });
  };

  useEffect(() => {
    if (isCalling) {
      setIsOnCall(true);
    } else {
      setIsOnCall(false);
    }
  }, [isCalling]);

  const toggleAudio = () => {
    mediaController.getAudioTracks()[0].enabled = !mediaController.getAudioTracks()[0]
      .enabled; // !isMicOff
    setIsMicOff(!isMicOff);
  };

  const toggleVideo = () => {
    mediaController.getVideoTracks()[0].enabled = !mediaController.getVideoTracks()[0]
      .enabled; // !isVideoOff
    setIsVideoOff(!isVideoOff);
  };

  const openUserMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMediaController(stream);
    let localStream = stream;
    stream
      .getTracks()
      .forEach(async (track) => await pc.addTrack(track, localStream));
    calleeLocalVidRef.current.srcObject = stream;
    calleeRemoteVidRef.current.srcObject = new MediaStream();
  };

  const handleEndCall = async () => {
    const tracks = document
      .querySelector("#CalleelocalVideo")
      ?.srcObject?.getTracks();
    tracks &&
      tracks.forEach((track) => {
        track.stop();
      });

    const remote_tracks = document
      .querySelector("#CalleeremoteVideo")
      ?.srcObject?.getTracks();
    remote_tracks &&
      remote_tracks.forEach((track) => {
        track.stop();
      });

    if (socket && callerProfile) {
      socket.emit(
        "message",
        JSON.stringify({
          type: "leave",
          caller: callerProfile?.userId,
          isCallee: false,
        })
      );
      endcall();
    }
    if (pc) {
      pc.close();
    }

    document.location.reload();
    document.getElementById("myModal").style.display = "none";
  };

  const onLeave = () => {
    const tracks = document
      .querySelector("#CalleelocalVideo")
      ?.srcObject?.getTracks();
    tracks &&
      tracks.forEach((track) => {
        track.stop();
      });

    const remote_tracks = document
      .querySelector("#CalleeremoteVideo")
      ?.srcObject?.getTracks();
    remote_tracks &&
      remote_tracks.forEach((track) => {
        track.stop();
      });

    endcall();
    if (pc) {
      pc.close();
    }
    document.location.reload();
    document.getElementById("myModal").style.display = "none";
  };

  const registerpcListeners = () => {
    pc.onicegatheringstatechange = () => {
      console.log(`ICE gathering state changed: ${pc.iceGatheringState}`);
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state change: ${pc.connectionState}`);
    };

    pc.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${pc.signalingState}`);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change: ${pc.iceConnectionState}`);
    };
  };

  return (
    <div className="calleeui__main">
      <video
        ref={calleeLocalVidRef}
        className="my_video__class"
        id="CalleelocalVideo"
        autoPlay
        muted
      ></video>
      <video
        ref={calleeRemoteVidRef}
        className="remote_video__class"
        id="CalleeremoteVideo"
        autoPlay
      ></video>
      <div className="calleeui__body">
        <div className="calleeui__profile__avatar">
          {callerProfile?.profile_pic ? (
            <Avatar
              id="callee__profile__avatar"
              src={callerProfile?.profile_pic && callerProfile.profile_pic}
              alt={callerProfile ? callerProfile.displayName : "Profile Pic"}
            />
          ) : (
            <ProfileLoader />
          )}
        </div>

        <div className="calleeui__displayName">
          <h3 id="callee__profile__displayName">
            {callerProfile
              ? callerProfile?.displayName?.toUpperCase()
              : "Mr.Receiver"}
          </h3>
        </div>
        <div className="calleeui__calling__status">
          <p>is Calling</p>
        </div>

        <div className="calleeui__control__buttons__container">
          <div className="control__button">
            <LinearScale />
          </div>

          <div
            id="toggle__video__btn"
            onClick={toggleVideo}
            className="control__button"
          >
            {isVideoOff ? <VideocamOff /> : <Videocam />}
          </div>

          <div
            id="toggle__audio__btn"
            onClick={toggleAudio}
            className="control__button"
          >
            {isMicOff ? <MicOff /> : <Mic />}
          </div>

          <div className="control__button">
            <OpenInBrowser />
          </div>

          <div className="control__button">
            <MoreHoriz />
          </div>

          <div id="callee__comment__btn" className="control__button">
            <Comment />
          </div>

          <div
            id="callee__hangup__btn"
            onClick={handleEndCall}
            className="control__button end__call__btn"
          >
            <CallEnd />
          </div>
        </div>
      </div>
    </div>
  );
};
CalleeUI.propTypes = {
  endcall: PropTypes.func.isRequired,
  makecall: PropTypes.func.isRequired,
  isCalling: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isCalling: state.socket.isCalling,
});

export default connect(mapStateToProps, { endcall, makecall })(CalleeUI);
