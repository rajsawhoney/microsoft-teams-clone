import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { db } from "../../firebase";
import "./IncomingCall.css";
import { connect } from "react-redux";
import ProfileLoader from "../Utils/ProfileLoader";
import { Avatar } from "@material-ui/core";
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

import { toast } from "react-toastify";

const IncomingCall = ({ my_profile }) => {
  const params = useParams();
  const history = useHistory();
  const [callerProfile, setCallerProfile] = useState(null);
  const [isMicOff, setIsMicOff] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callProfile, setCallProfile] = useState();
  const [mediaController, setMediaController] = useState();
  const [roomId, setRoomId] = useState(null);

  let pc = null;
  let localStream = null;
  let remoteStream = null;
  const configuration = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  useEffect(() => {
    if (params?.userId && params?.roomId) {
      setRoomId(params?.roomId);
      db.collection("user_profiles")
        .doc(params?.userId)
        .get()
        .then((res) => {
          if (res.exists) {
            setCallerProfile(res.data());
            openUserMedia();
          } else {
            console.log("No user profile  found!!!!!");
          }
        });

    }
  }, [params?.userId]);

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

  useEffect(() => {
    if (my_profile && roomId) {
      AnswerCall();
    }
  }, []);

  const AnswerCall = async () => {
    const roomRef = db.collection("rooms").doc(params?.roomId);
    const roomSnapshot = await roomRef.get();
    console.log("We Got the Room:", roomSnapshot.exists);
    if (roomSnapshot.exists) {
      console.log("Create pc with configuration: ", configuration);
      pc = new RTCPeerConnection(configuration);
      registerPeerConnectionListeners();
      localStream &&
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });

      // Code for collecting ICE candidates below
      const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("Got final candidate!");
          return;
        }
        console.log("Got candidate: ", event.candidate);
        calleeCandidatesCollection.add(event.candidate.toJSON());
      };
      // Code for collecting ICE candidates above
      pc.ontrack = (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          remoteStream.addTrack(track);
        });
      };

      // Code for creating SDP answer below
      const offer = roomSnapshot.data().offer;
      console.log("Got offer:", offer);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      console.log("Created answer:", answer);
      await pc.setLocalDescription(answer);

      const roomWithAnswer = {
        caller: callerProfile?.userId,
        callee: my_profile?.userId,
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        type: "answer",
      };
      await roomRef.update(roomWithAnswer);
      // Code for creating SDP answer above

      // Listening for remote ICE candidates below
      roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            console.log(
              `Got new remote ICE candidate: ${JSON.stringify(data)}`
            );
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      // Listening for remote ICE candidates above
      return true;
    } else {
      console.log("None is calling me....");
      return false;
    }
  };

  const openUserMedia = async (e) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // setMediaController(stream);
    document.querySelector("#localVideo").srcObject = stream;
    localStream = stream;
    setMediaController(stream);
    remoteStream = new MediaStream();
    document.querySelector("#remoteVideo").srcObject = remoteStream;
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

    toast.success("Call Ended!!!!!!");

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Delete room on hangup
    if (params?.roomId) {
      const roomRef = db.collection("rooms").doc(params?.roomId);
      const calleeCandidates = await roomRef
        .collection("calleeCandidates")
        .get();
      calleeCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      const callerCandidates = await roomRef
        .collection("callerCandidates")
        .get();
      callerCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      await roomRef.delete();
    }

    if (pc) {
      pc.close();
    }
    document.querySelector("#localVideo").srcObject = null;
    document.querySelector("#remoteVideo").srcObject = null;

    history.goBack();
  };

  const registerPeerConnectionListeners = () => {
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
      <div className="my__video__area">
        <video id="localVideo" autoPlay muted></video>
      </div>

      <div className="partner__video__area">
        <video id="remoteVideo" autoPlay></video>
        <h2>Waiting for {callProfile?.displayName}'s Video</h2>
        <ProfileLoader />
      </div>

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
const mapStateToProps = (state) => ({
  my_profile: state.accounts.my_profile,
});

export default connect(mapStateToProps)(IncomingCall);
