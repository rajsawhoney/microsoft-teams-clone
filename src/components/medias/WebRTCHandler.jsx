import React, { useEffect, useState } from "react";
import { db } from "../../firebase";

const WebRTCHandler = () => {
    //Creating offer and the stuffs
    const roomRef = db.collection('rooms');
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
}

let localStream=null;
let pc=null;

const createOfferAndStuffs = ()=>{
    pc = new RTCpc(configuration);
    const offer = pc.createOffer();
    registerpeerConnectionListeners();

    localStream &&
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection("callerCandidates");
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    };
    // Code for collecting ICE candidates above

    // Code for creating a room below i.e making an offer
    const offer = await pc.createOffer();
    //here offer contains two things i.e sdp and type
    await pc
      .setLocalDescription(offer)
      .then((result) => {
        console.log("Local description successfully set:");
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("Created offer:", offer);

    const roomWithOffer = {
        caller:my_profile?.userId,
        receiver:params?.userId,
        type: offer.type,
        sdp:offer.sdp,
      }

    await roomRef.set(roomWithOffer);
    setRoomId(roomRef?.id);
    console.log(`New room created with SDP offer. Room ID: ${roomRef?.id}`);
    pc.ontrack = (event) => {
      console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Add a track to the remoteStream:", track);
        remoteStream.addTrack(track);
      });
    };

    // Listening for remote session description below
    roomRef.where('type','==','answer').where('caller','==',my_profile.userId).onSnapshot(async (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data && data.answer) {
        console.log("Got remote description: ", data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(rtcSessionDescription);
      } else {
        console.log("I am waiting for answer");
      }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listen for remote ICE candidates above
}

const joinRoomById = async () => {
    const roomRef = db
      .collection("user_profiles")
      .doc(params?.userId)
      .collection("call_collection")
      .doc(roomId);
    const roomSnapshot = await roomRef.get();
    console.log("We Got the Room:", roomSnapshot.exists);

    if (roomSnapshot.exists) {
      console.log("Create pc with configuration: ", configuration);
      pc = new RTCpc(configuration);
      registerpcListeners();
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
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
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
    setMediaController(stream);
    document.querySelector("#localVideo").srcObject = stream;
    localStream = stream;
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

    // localStream.getTracks()[0].stop();
    const remoteTracks = document
    .querySelector("#remoteVideo")
    ?.srcObject?.getTracks();
    if (remoteTracks) {
      remoteTracks.getTracks().forEach((track) => track.stop());
    }

    if (pc) {
      pc.close();
    }
    document.querySelector("#localVideo").srcObject = null;
    document.querySelector("#remoteVideo").srcObject = null;
    // Delete room on hangup
    if (roomId) {
      const roomRef = db.collection("rooms").doc(roomId)
      await roomRef.delete();
    }
    // document.location.reload(true);
    history.push(`/chat/chat-detail/${params.userId}`);
  };

  const registerpeerConnectionListeners = () => {
    pc.onicegatheringstatechange = () => {
      console.log(
        `ICE gathering state changed: ${pc.iceGatheringState}`
      );
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state change: ${pc.connectionState}`);
    };

    pc.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${pc.signalingState}`);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state change: ${pc.iceConnectionState}`
      );
    };
  };
  return (
    <div className="call__Container">
      <div className="callui__body">
        <h2>This is Call UI Body</h2>
      </div>
    </div>
  );
};

export default WebRTCHandler;
