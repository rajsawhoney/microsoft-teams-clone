import React, { useRef, useState, useEffect } from "react";

import { firedb, db } from "./firebase";

function App() {
  let localVideoref = useRef();
  let remoteVideoref = useRef();

  var database = firedb.ref();
  var localVideo = document.getElementById("yourVideo");
  var remoteVideo = document.getElementById("frndsVideo");
  var mediaConstraints = {
    audio: true, // We want an audio track
    video: {
      aspectRatio: {
        ideal: 1.333333, // 3:2 aspect is preferred
      },
    },
  };

  var myUsername = Math.random() * 20000000000000000000000000;
  var targetUsername = Math.random() * 20000000000000000000000000; // To store username of other peer
  var myPeerConnection = null; // RTCPeerConnection
  var transceiver = null; // RTCRtpTransceiver
  var webcamStream = null; // MediaStream from webcam
  var isNegotiating = false;

  function sendToServer(msg) {
    var msgJSON = JSON.stringify(msg);
    var dbref = database.push(msgJSON);
    console.log("Sending '" + msg.type + "' message: " + msgJSON);
    //   connection.send(msgJSON);
    setTimeout(() => {
      dbref.remove();
    }, 4000);
  }

  function readServer(data) {
    var msg = JSON.parse(data.val());
    console.log("data received:", msg);
    switch (msg.type) {
      case "video-offer":
        handleVideoOfferMsg(msg);
        break;
      case "video-answer":
        handleVideoAnswerMsg(msg);
        break;
      case "new-ice-candidate":
        handleNewICECandidateMsg(msg);
        break;
      case "hang-up":
        handleHangUpMsg(msg);
        break;

      default:
        break;
    }
  }

  database.on("child_added", readServer);

  async function createPeerConnection() {
    console.log("Setting up a connection...");
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

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.ontrack = handleTrackEvent;
  }

  // Called by the WebRTC layer to let us know when it's time to
  // begin, resume, or restart ICE negotiation.

  async function handleNegotiationNeededEvent() {
    console.log("*** Negotiation needed");
    if (isNegotiating) {
      console.log("SKIP nested negotiations");
      return;
    }
    isNegotiating = true;

    try {
      console.log("---> Creating offer");
      const offer = await myPeerConnection.createOffer();

      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.

      if (myPeerConnection.signalingState != "stable") {
        console.log(" -- The connection isn't stable yet; postponing...");
        return;
      }

      // Establish the offer as the local peer's current
      // description.

      console.log("---> Setting local description to the offer");
      await myPeerConnection.setLocalDescription(offer);

      // Send the offer to the remote peer.

      console.log("---> Sending the offer to the remote peer");
      sendToServer({
        name: myUsername,
        target: targetUsername,
        type: "video-offer",
        sdp: myPeerConnection.localDescription,
      });
    } catch (err) {
      console.log(
        "*** The following error occurred while handling the negotiationneeded event:"
      );
    }
  }

  function handleTrackEvent(event) {
    console.log("*** Track event");
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.onloadedmetadata = () => {
      remoteVideo.play();
    };
  }

  function handleICECandidateEvent(event) {
    if (event.candidate) {
      console.log("*** Outgoing ICE candidate: " + event.candidate.candidate);

      sendToServer({
        type: "new-ice-candidate",
        target: targetUsername,
        candidate: event.candidate,
      });
    }
  }

  function handleICEConnectionStateChangeEvent(event) {
    console.log(
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

  function handleSignalingStateChangeEvent(event) {
    console.log(
      "*** WebRTC signaling state changed to: " +
        myPeerConnection.signalingState
    );
    switch (myPeerConnection.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  }

  function handleICEGatheringStateChangeEvent(event) {
    console.log(
      "*** ICE gathering state changed to: " +
        myPeerConnection.iceGatheringState
    );
  }

  // function handleUserlistMsg(msg) {
  //   var i;
  //   var listElem = document.querySelector(".userlistbox");

  //   while (listElem.firstChild) {
  //     listElem.removeChild(listElem.firstChild);
  //   }

  //   // Add member names from the received list.

  //   msg.users.forEach(function (username) {
  //     var item = document.createElement("li");
  //     item.appendChild(document.createTextNode(username));
  //     item.addEventListener("click", invite, false);

  //     listElem.appendChild(item);
  //   });
  // }

  function closeVideoCall() {
    var localVideo = document.getElementById("local_video");
    console.log("Closing the call");

    // Close the RTCPeerConnection

    if (myPeerConnection) {
      console.log("--> Closing the peer connection");

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      myPeerConnection.ontrack = null;
      myPeerConnection.onicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnotificationneeded = null;

      // Stop all transceivers on the connection

      //   myPeerConnection.getTransceivers().forEach((transceiver) => {
      //     transceiver.stop();
      //   });

      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.

      if (localVideo) {
        localVideo.pause();
        localVideo.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Close the peer connection

      myPeerConnection.close();
      myPeerConnection = null;
      webcamStream = null;
    }

    // Disable the hangup button

    //   document.getElementById("hangup-button").disabled = true;
    targetUsername = null;
  }

  // Handle the "hang-up" message, which is sent if the other peer
  // has hung up the call or otherwise disconnected.

  function handleHangUpMsg(msg) {
    console.log("*** Received hang up notification from other peer");
    closeVideoCall();
  }

  function hangUpCall() {
    closeVideoCall();

    sendToServer({
      name: myUsername,
      target: targetUsername,
      type: "hang-up",
    });
  }

  async function invite(evt) {
    console.log("Starting to prepare an invitation");
    if (myPeerConnection) {
      alert("You can't start a call because you already have one open!");
    } else {
      var clickedUsername = Math.random() * 1000000000000000;
      // Don't allow users to call themselves, because weird.

      if (clickedUsername === myUsername) {
        alert(
          "I'm afraid I can't let you talk to yourself. That would be weird."
        );
        return;
      }

      // Record the username being called for future reference

      targetUsername = clickedUsername;
      console.log("Inviting user " + targetUsername);

      // Call createPeerConnection() to create the RTCPeerConnection.
      // When this returns, myPeerConnection is our RTCPeerConnection
      // and webcamStream is a stream coming from the camera. They are
      // not linked together in any way yet.

      console.log("Setting up connection to invite user: " + targetUsername);
      createPeerConnection();

      // Get access to the webcam stream and attach it to the
      // "preview" box (id "local_video").

      try {
        webcamStream = await navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
        localVideo.srcObject = webcamStream;
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
    targetUsername = msg.name;

    // If we're not already connected, create an RTCPeerConnection
    // to be linked to the caller.

    console.log("Received video chat offer from " + targetUsername);
    if (!myPeerConnection) {
      createPeerConnection();
    }

    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.

    var desc = new RTCSessionDescription(msg.sdp);

    // If the connection isn't stable yet, wait for it...

    if (myPeerConnection.signalingState != "stable") {
      console.log(
        "  - But the signaling state isn't stable, so triggering rollback"
      );

      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        myPeerConnection.setLocalDescription({ type: "rollback" }),
        myPeerConnection.setRemoteDescription(desc),
      ]);
      return;
    } else {
      console.log("  - Setting remote description");
      await myPeerConnection.setRemoteDescription(desc);
    }

    // Get the webcam stream if we don't already have it

    if (!webcamStream) {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia(
          mediaConstraints
        );
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }

      localVideo.srcObject = webcamStream;

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

    console.log("---> Creating and sending answer to caller");

    await myPeerConnection.setLocalDescription(
      await myPeerConnection.createAnswer()
    );

    sendToServer({
      name: myUsername,
      target: targetUsername,
      type: "video-answer",
      sdp: myPeerConnection.localDescription,
    });
  }

  // Responds to the "video-answer" message sent to the caller
  // once the callee has decided to accept our request to talk.

  async function handleVideoAnswerMsg(msg) {
    console.log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    var desc = new RTCSessionDescription(msg.sdp);
    if (!myPeerConnection.localDescription) {
      return;
    }
    await myPeerConnection.setRemoteDescription(desc).catch((err) => {
      console.log("#######Failed to setRemoteDescription due,", err);
    });
  }

  // A new ICE candidate has been received from the other peer. Call
  // RTCPeerConnection.addIceCandidate() to send it along to the
  // local ICE framework.

  async function handleNewICECandidateMsg(msg) {
    if (msg.candidate === undefined) {
      return;
    }
    var candidate = new RTCIceCandidate(msg.candidate);

    console.log(
      "*** Adding received ICE candidate: " + JSON.stringify(candidate)
    );
    try {
      await myPeerConnection.addIceCandidate(candidate);
    } catch (err) {
      console.log(err);
    }
  }

  function handleGetUserMediaError(e) {
    console.log(e);
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

  //   var yourId = Math.floor(Math.random() * 1000000000);
  //Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
  //   var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'beaver','username': 'webrtc.websitebeaver@gmail.com'}]};
  //   var pc = new RTCPeerConnection(pc_config);
  //   pc.onicecandidate = (event) =>
  //     event.candidate
  //       ? sendMessage(yourId, JSON.stringify({ ice: event.candidate }))
  //       : console.log("Sent All Ice");

  //   pc.ontrack = async (event) => {
  //     friendsVideo.srcObject = event.streams[0];
  //   };

  //   function sendMessage(senderId, data) {
  //     var msg = database.push({ sender: senderId, message: data });
  //     msg.remove();
  //   }

  //   function readMessage(data) {
  //     var msg = JSON.parse(data.val().message);
  //     var sender = data.val().sender;
  //     if (sender != yourId) {
  //       if (msg.ice != undefined)
  //         pc.addIceCandidate(new RTCIceCandidate(msg.ice));
  //       else if (msg.sdp.type == "offer")
  //         pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
  //           .then(() => pc.createAnswer())
  //           .then((answer) => pc.setLocalDescription(answer))
  //           .then(() =>
  //             sendMessage(yourId, JSON.stringify({ sdp: pc.localDescription }))
  //           );
  //       else if (msg.sdp.type == "answer")
  //         pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  //     }
  //   }

  //   database.on("child_added", readMessage);

  //   function showMyFace() {
  //     navigator.mediaDevices
  //       .getUserMedia({ audio: true, video: true })
  //       .then((stream) => {
  //         yourVideo.srcObject = stream;
  //         pc.addStream(stream);
  //       });
  //   }

  //   function showFriendsFace() {
  //     pc.createOffer()
  //       .then((offer) => pc.setLocalDescription(offer))
  //       .then(() =>
  //         sendMessage(yourId, JSON.stringify({ sdp: pc.localDescription }))
  //       );
  //   }

  return (
    <div>
      {/* <video
          ref={localVideoref}
          id="yourVideo"
          autoPlay
          muted
        ></video>

        <video ref={remoteVideoref} id="frndsVideo" autoPlay playsInline></video> */}

      <br />
      <button onClick={invite} type="button" className="btn btn-primary btn-lg">
        <span
          className="glyphicon glyphicon-facetime-video"
          aria-hidden="true"
        ></span>{" "}
        Call
      </button>
    </div>
  );
}

export default App;
