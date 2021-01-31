import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
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
import { useParams, useHistory } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import { db } from "../../firebase";
import ProfileLoader from "../Utils/ProfileLoader";
import "./CallerUI.css";
import { toast } from "react-toastify";
import { makecall } from "../../redux/actions/socket/makecall";
import { endcall } from "../../redux/actions/socket/endcall";
import { connect } from "react-redux";

const CallerUI = ({ my_profile, socket, makecall, endcall, isCalling }) => {
  const params = useParams();
  const history = useHistory();
  const [isMicOff, setIsMicOff] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callProfile, setCallProfile] = useState();
  const [mediaController, setMediaController] = useState();
  const localVidRef = useRef();
  const remoteVidRef = useRef();

  let pc = null;

  var peerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

  var sessionDescription =
    window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

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
    if (params?.userId && my_profile && socket) {
      db.collection("user_profiles")
        .doc(params?.userId)
        .get()
        .then((res) => {
          res.exists && setCallProfile(res.data());
        });
      //opens the camera stuffs and set the local video
      openUserMedia();

      registerpcListeners(); //keeps track of iceConnectionStateChange

      socket.on("message", (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
          // case "offer":
          //   console.log("GEtting offer from the calller inside caller...");
          //   break;
          case "answer":
            onAnswer(data);
            break;

          case "leave":
            onLeave();
            break;

          // case "open_modal":
          //   console.log("Opening callee modal...");
          //   document.getElementById("myModal").style.display = "block";
          //   break;

          case "candidate":
            console.log("Receiving candidates from the callee side...");
            onCandidate(data);
            break;

          default:
            break;
        }
      });
      pc.onnegotiationneeded = () => {
        createOffer();
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("Got final candidate!");
          return;
        }
        console.log(
          "Got new candidate in caller Side and sending to callee side..."
        );

        params?.userId &&
          sendToPeer({
            type: "candidate",
            sendto: params?.userId,
            candidate: event.candidate,
          });
      };
    }
  }, []);

  const onCandidate = (data) => {
    console.log("Adding iceCandidate to the PeerConnection...");
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  const sendToPeer = (message) => {
    socket.emit("message", JSON.stringify(message));
  };

  setTimeout(() => {
    pc.ontrack = function (obj) {
      console.log(
        "Caller Side:Got track from the  callee Side!!!",
        obj.streams
      );
      remoteVidRef.current.srcObject = obj.streams[0];
    };
  }, 3000);

  const createOffer = () => {
    console.log("Creating Offer okkkkkk....");
    // initiates the creation of SDP
    pc.createOffer().then((offer) => {
      // set offer sdp as local description
      makecall();

      pc.setLocalDescription(offer);
      sendToPeer({
        type: "offer",
        offer: offer,
        caller: my_profile?.userId,
        callee: params?.userId,
      });
    });
  };

  const onAnswer = (data) => {
    console.log(
      "Setting remoteDesc out of answer and waiting for the iceCandidates..."
    );
    pc.setRemoteDescription(data.answer);
  };

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
    localVidRef.current.srcObject = stream;
    remoteVidRef.current.srcObject = new MediaStream();
    toast.success("Camera opened!!!!!!");
  };

  const handleEndCall = async (e) => {
    const tracks = document
      .querySelector("#localVideo")
      ?.srcObject?.getTracks();
    tracks &&
      tracks.forEach((track) => {
        track.stop();
      });

    sendToPeer({ type: "leave", callee: params?.userId, isCallee: true });
    endcall();

    if (pc) {
      pc.close();
    }

    history.push(`/chat/chat-detail/${params.userId}`);
  };

  const onLeave = async () => {
    const tracks = document
      .querySelector("#localVideo")
      ?.srcObject?.getTracks();
    tracks &&
      tracks.forEach((track) => {
        track.stop();
      });
    endcall();
    if (pc) {
      pc.close();
    }
    setTimeout(() => {
      history.push(`/chat/chat-detail/${params.userId}`);
    }, 1000);
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
    <div className="callui__main">
      <video
        ref={localVidRef}
        className="my__video__area"
        id="localVideo"
        autoPlay
        muted
      ></video>
      <video
        ref={remoteVidRef}
        className="partner__video__area"
        id="remoteVideo"
        autoPlay
      ></video>

      <div className="callui__body">
        <div className="callui__profile__avatar">
          {callProfile?.profile_pic ? (
            <Avatar
              src={callProfile?.profile_pic && callProfile.profile_pic}
              alt={callProfile ? callProfile.displayName : "Profile Pic"}
            />
          ) : (
            <ProfileLoader />
          )}
        </div>

        <div className="callui__calling__status">
          <p>Calling</p>
        </div>

        <div className="callui__displayName">
          <h3>
            {callProfile
              ? callProfile?.displayName?.toUpperCase()
              : "Mr.Receiver"}
          </h3>
        </div>

        <div className="callui__control__buttons__container">
          <div className="control__button">
            <LinearScale />
          </div>

          <div onClick={toggleVideo} className="control__button">
            {isVideoOff ? <VideocamOff /> : <Videocam />}
          </div>

          <div onClick={toggleAudio} className="control__button">
            {isMicOff ? <MicOff /> : <Mic />}
          </div>

          <div className="control__button">
            <OpenInBrowser />
          </div>

          <div className="control__button">
            <MoreHoriz />
          </div>

          <div className="control__button">
            <Comment />
          </div>

          <div
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

CallerUI.propTypes = {
  makecall: PropTypes.func.isRequired,
  endcall: PropTypes.func.isRequired,
  socket: PropTypes.object,
  my_profile: PropTypes.object,
  isCalling: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  my_profile: state.accounts.my_profile,
  socket: state.socket.socket,
  isCalling: state.socket.isCalling,
});

export default connect(mapStateToProps, { makecall, endcall })(CallerUI);
