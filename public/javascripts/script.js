'use strict';

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  video: true,
};
var pc;


let turnConfig = {


}


const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');
const startButton = document.querySelector('#start');
const callButton = document.querySelector('#call');
const hangupButton = document.querySelector('#hangup');

navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

// Local stream that will be reproduced on the video.
let localStream;

// Handles success by adding the MediaStream to the video element.
function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream;
  console.log('Received local stream.');
    callButton.disabled = false;  // Enable call button.


}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// Initializes media stream.



startButton.addEventListener('click',function(event){
    console.log('startButton ')

})

callButton.addEventListener('click',function(event){
    console.log('callButton ')
createPeerConnection();

})

hangupButton.addEventListener('click',function(event){
    console.log('hangupButton ')

})


//Creating peer connection
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(turnConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onicecandidateerror = handleIceError;
    pc.onicegatheringstatechange = handleIceStateChange;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.ontrack = handleTrack;
        pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
    console.log(pc.connectionState);
    var sd = pc.currentRemoteDescription;
    if (sd) {
      alert("Local session: type='" +
            sd.type + "'; sdp description='" +
            sd.sdp + "'");
    }
    else {
      alert("No local session yet.");
    }

  } catch (e) {
    console.log(e)
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, room);
  } else {
    console.log('End of candidates.');
  }
}

function handleIceError(event) {
  console.log('icecandidate error: ', event);

}
function handleIceStateChange(event) {
    console.log('icecandidate state change: ', event);
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function handleTrack(event) {
  console.log('Remote stream removed. Event: ', event);
}