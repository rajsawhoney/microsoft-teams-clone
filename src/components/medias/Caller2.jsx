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
  const [negotioned, setNegotioned] = useState(false);
  const [mediaController, setMediaController] = useState();
  const localVidRef = useRef();
  const remoteVidRef = useRef();
  // See also:
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  //

  useEffect(() => {
    if (params?.userId && my_profile) {
      db.collection("user_profiles")
        .doc(params?.userId)
        .get()
        .then((res) => {
          res.exists && setCallProfile(res.data());
        });

      //   setTimeout(() => {
      //     invite();
      //   }, 2000);
    }
  }, [params?.userId]);

  var mediaConstraints = {
    audio: true, // We want an audio track
    video: {
      aspectRatio: {
        ideal: 1.333333, // 3:2 aspect is preferred
      },
    },
  };

  var myPeerConnection = null; // RTCPeerConnection
  var transceiver = null; // RTCRtpTransceiver
  var webcamStream = null; // MediaStream from webcam

  // Output logging information to console.

  function log(text) {
    var time = new Date();

    console.log("[" + time.toLocaleTimeString() + "] " + text);
  }

  // Output an error message to console.

  function log_error(text) {
    var time = new Date();

    console.trace("[" + time.toLocaleTimeString() + "] " + text);
  }

  // Send a JavaScript object by converting it to JSON and sending
  // it as a message on the WebSocket connection.

  function sendToServer(msg) {
    var msgJSON = JSON.stringify(msg);
    log("Sending '" + msg.type + "' message: ");
    socket.emit("message", msgJSON);
  }

  // Called when the "id" message is received; this message is sent by the
  // server to assign this login session a unique ID number; in response,
  // this function sends a "username" message to set our username for this
  // session.

  // Open and configure the connection to the WebSocket server.

  useEffect(() => {
    if (socket) {
      console.log("We are in for socket event collection");
      socket.on("message", (data) => {
        var msg = JSON.parse(data);
        log("Message received: ", msg);

        switch (msg.type) {
          // signaling information during negotiations leading up to a video call
          case "offer": // Invitation and offer to chat
            handleVideoOfferMsg(msg);
            break;

          case "answer": // Callee has answered our offer
            handleVideoAnswerMsg(msg);
            break;

          case "candidate": // A new ICE candidate has been received
            handleNewICECandidateMsg(msg);
            break;

          case "leave": // The other peer has hung up the call
            handleHangUpMsg(msg);
            break;

          // Unknown message; output to console for debugging.

          default:
            log_error("Unknown message received:");
            log_error(msg);
        }
      });
    } else {
      console.log("No socket instance found...!!!!!!!");
    }
  });
  // Handler for keyboard events. This is used to intercept the return and
  // enter keys so that we can call send() to transmit the entered text
  // to the server.
  //   function handleKey(evt) {
  //     if (evt.keyCode === 13 || evt.keyCode === 14) {
  //       if (!document.getElementById("send").disabled) {
  //         handleSendButton();
  //       }
  //     }
  //   }

  // Create the RTCPeerConnection which knows how to talk to our
  // selected STUN/TURN server and then uses getUserMedia() to find
  // our camera and microphone and add that stream to the connection for
  // use in our video call. Then we configure event handlers to get
  // needed notifications on the call.

  async function createPeerConnection() {
    log("Setting up a connection...");

    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.

    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    });

    // Set up event handlers for the ICE negotiation process.
    if (!negotioned) {

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
      myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;

    myPeerConnection.ontrack = handleTrackEvent;
  }}

  // Called by the WebRTC layer to let us know when it's time to
  // begin, resume, or restart ICE negotiation.

  async function handleNegotiationNeededEvent() {
    if (negotioned) {
      log("Already netioned dear!!!!!");
      return;
    }
    log("*** Negotiation needed");
    try {
      log("---> Creating offer");
      const offer = await myPeerConnection.createOffer();

      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.

      if (myPeerConnection.signalingState != "stable") {
        log("     -- The connection isn't stable yet; postponing...");
        return;
      }

      // Establish the offer as the local peer's current
      // description.

      log("---> Setting local description to the offer");
      await myPeerConnection.setLocalDescription(offer);

      // Send the offer to the remote peer.

      log("---> Sending the offer to the remote peer");
      sendToServer({
        from: my_profile?.userId,
        target: params?.userId,
        type: "offer",
        offer: myPeerConnection.localDescription,
      });
    } catch (err) {
      log(
        "*** The following error occurred while handling the negotiationneeded event:"
      );
      reportError(err);
    }

    setNegotioned(true);
  }

  // In our case, we're just taking the first stream found and attaching
  // it to the <video> element for incoming media.

  function handleTrackEvent(event) {
    log("*** Track event");
    document.getElementById("remoteVideo").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
  }

  // Handles |icecandidate| events by forwarding the specified
  // ICE candidate (created by our local ICE agent) to the other
  // peer through the signaling server.

  function handleICECandidateEvent(event) {
    if (event.candidate) {
      log("*** Outgoing ICE candidate: " + event.candidate.candidate);

      sendToServer({
        type: "candidate",
        target: params?.userId,
        candidate: event.candidate,
      });
    }
  }

  // Handle |iceconnectionstatechange| events. This will detect
  // when the ICE connection is closed, failed, or disconnected.
  // This is called when the state of the ICE agent changes.

  function handleICEConnectionStateChangeEvent(event) {
    log(
      "*** ICE connection state changed to " +
        myPeerConnection.iceConnectionState
    );

    switch (myPeerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        closeVideoCall();
        break;
    }
  }

  // NOTE: This will actually move to the new RTCPeerConnectionState enum
  // returned in the property RTCPeerConnection.connectionState when
  // browsers catch up with the latest version of the specification!

  function handleSignalingStateChangeEvent(event) {
    log(
      "*** WebRTC signaling state changed to: " +
        myPeerConnection.signalingState
    );
    switch (myPeerConnection.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  }

  // We don't need to do anything when this happens, but we log it to the
  // console so you can see what's going on when playing with the sample.

  function handleICEGatheringStateChangeEvent(event) {
    log(
      "*** ICE gathering state changed to: " +
        myPeerConnection.iceGatheringState
    );
  }

  // Close the RTCPeerConnection and reset variables so that the user can
  // make or receive another call if they wish. This is called both
  // when the user hangs up, the other user hangs up, or if a connection
  // failure is detected.

  function closeVideoCall() {
    var localVideo = document.getElementById("localVideo");

    log("Closing the call");

    // Close the RTCPeerConnection

    if (myPeerConnection !== null) {
      log("--> Closing the peer connection");

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      myPeerConnection.ontrack = null;
      myPeerConnection.onnicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnegotiationneeded = null;

      // Stop all transceivers on the connection

      myPeerConnection.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });

      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.

      // Close the peer connection

      myPeerConnection.close();
      myPeerConnection = null;
      webcamStream = null;
    }

    // Disable the hangup button

    // document.getElementById("hangup-button").disabled = true;
    // targetUsername = null;

    if (localVideo.srcObject) {
      localVideo.pause();
      localVideo.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }

    history.goBack();
  }

  // Handle the "hang-up" message, which is sent if the other peer
  // has hung up the call or otherwise disconnected.

  function handleHangUpMsg(msg) {
    log("*** Received hang up notification from other peer");
    closeVideoCall();
  }

  // Hang up the call by closing our end of the connection, then
  // sending a "hang-up" message to the other peer (keep in mind that
  // the signaling is done on a different connection). This notifies
  // the other peer that the connection should be terminated and the UI
  // returned to the "no call in progress" state.

  function hangUpCall() {
    closeVideoCall();

    sendToServer({
      //   caller: my_profile?.userId,
      sendto: params?.userId,
      type: "leave",
    });
  }

  // Handle a click on an item in the user list by inviting the clicked
  // user to video chat. Note that we don't actually send a message to
  // the callee here -- calling RTCPeerConnection.addTrack() issues
  // a |notificationneeded| event, so we'll let our handler for that
  // make the offer.

  async function invite(evt) {
    log("Starting to prepare an invitation");
    if (myPeerConnection) {
      alert("You can't start a call because you already have one open!");
    } else {
      createPeerConnection();
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
        setMediaController(webcamStream);
        document.getElementById("localVideo").srcObject = webcamStream;
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }

      // Add the tracks from the stream to the RTCPeerConnection

      try {
        webcamStream.getTracks().forEach(
          (transceiver = (track) =>
            myPeerConnection.addTransceiver(track, {
              streams: [webcamStream],
            }))
        );
      } catch (err) {
        handleGetUserMediaError(err);
      }
    }
  }

  // Accept an offer to video chat. We configure our local settings,
  // create our RTCPeerConnection, get and attach our local camera
  // stream, then create and send an answer to the caller.

  async function handleVideoOfferMsg(msg) {
    // If we're not already connected, create an RTCPeerConnection
    const caller = msg.from;
    log("Received video chat offer from " + caller);
    if (myPeerConnection === null) {
      createPeerConnection();
    }

    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.

    var desc = new RTCSessionDescription(msg.offer);

    // If the connection isn't stable yet, wait for it...

    if (myPeerConnection.signalingState != "stable") {
      log("  - But the signaling state isn't stable, so triggering rollback");

      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        myPeerConnection.setLocalDescription({ type: "rollback" }),
        myPeerConnection.setRemoteDescription(desc),
      ]);
      return;
    } else {
      log("  - Setting remote description");
      await myPeerConnection.setRemoteDescription(desc);
    }

    // Get the webcam stream if we don't already have it

    if (!webcamStream) {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
        setMediaController(webcamStream);
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }

      document.getElementById("localVideo").srcObject = webcamStream;

      // Add the camera stream to the RTCPeerConnection

      try {
        webcamStream.getTracks().forEach(
          (transceiver = (track) =>
            myPeerConnection.addTransceiver(track, {
              streams: [webcamStream],
            }))
        );
      } catch (err) {
        handleGetUserMediaError(err);
      }
    }

    log("---> Creating and sending answer to caller");

    await myPeerConnection.setLocalDescription(
      await myPeerConnection.createAnswer()
    );

    sendToServer({
      from: my_profile?.userId,
      target: caller,
      type: "answer",
      answer: myPeerConnection.localDescription,
    });
  }

  // Responds to the "video-answer" message sent to the caller
  // once the callee has decided to accept our request to talk.

  async function handleVideoAnswerMsg(msg) {
    log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    var desc = new RTCSessionDescription(msg.answer);
    if (myPeerConnection) {
      await myPeerConnection.setRemoteDescription(desc).catch(reportError);
    } else {
      console.log("No PeerConnection Found!!!!!", myPeerConnection);
    }
  }

  // A new ICE candidate has been received from the other peer. Call
  // RTCPeerConnection.addIceCandidate() to send it along to the
  // local ICE framework.

  async function handleNewICECandidateMsg(msg) {
    var candidate = new RTCIceCandidate(msg.candidate);

    log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
    try {
      await myPeerConnection.addIceCandidate(candidate);
    } catch (err) {
      reportError(err);
    }
  }

  // Handle errors which occur when trying to access the local media
  // hardware; that is, exceptions thrown by getUserMedia(). The two most
  // likely scenarios are that the user has no camera and/or microphone
  // or that they declined to share their equipment when prompted. If
  // they simply opted not to share their media, that's not really an
  // error, so we won't present a message in that situation.

  function handleGetUserMediaError(e) {
    log_error(e);
    switch (e.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }

    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.

    closeVideoCall();
  }

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

  function reportError(errMessage) {
    log_error(`Error ${errMessage.name}: ${errMessage.message}`);
  }
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
            onClick={invite}
            style={{ background: "green" }}
            className="control__button"
          >
            <CallEnd />
          </div>

          <div onClick={hangUpCall} className="control__button end__call__btn">
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
